import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , language, sourceArg] = process.argv;
if (!language || !sourceArg) throw new Error("Usage: node scripts/build-language-lexicon.mjs <language> <word-csv>");
const source = resolve(sourceArg);

function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  const input = String(text).replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ""; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
function csv(rows) { return rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n") + "\n"; }
function slug(value) {
  return String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}
function shortHash(value) {
  let hash = 2166136261;
  for (const ch of String(value)) { hash ^= ch.codePointAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}

const rows = parseCsv(readFileSync(source, "utf8"));
const inputHeaders = rows.shift().map(value => value.trim());
const previousIdIndex = inputHeaders.indexOf("lexeme_id");
const headers = inputHeaders.filter((_, index) => index !== previousIdIndex);
if (previousIdIndex >= 0) for (let index = 0; index < rows.length; index++) rows[index] = rows[index].filter((_, column) => column !== previousIdIndex);
const englishIndex = headers.indexOf("english"), targetIndex = headers.indexOf("target");
if (englishIndex < 0 || targetIndex < 0) throw new Error("The source CSV needs english and target columns.");
const records = rows.filter(row => row.some(value => String(value).trim())).map((row, index) => ({ row, index, english:row[englishIndex] || "", target:row[targetIndex] || "" }));
const sensesByTarget = new Map();
for (const record of records) {
  const key = record.target.normalize("NFC").toLocaleLowerCase("en-US");
  if (!sensesByTarget.has(key)) sensesByTarget.set(key, new Set());
  sensesByTarget.get(key).add(record.english.normalize("NFC").toLocaleLowerCase("en-US"));
}
const used = new Map(), lexicon = new Map();
for (const record of records) {
  const targetKey = record.target.normalize("NFC").toLocaleLowerCase("en-US"), targetSlug = slug(record.target);
  let id = `${language}.lex.${targetSlug}`;
  if ((sensesByTarget.get(targetKey)?.size || 0) > 1) id += `.${slug(record.english)}`;
  const identity = `${targetKey}\u0000${record.english.normalize("NFC").toLocaleLowerCase("en-US")}`;
  if (used.has(id) && used.get(id) !== identity) id += `-${shortHash(identity)}`;
  used.set(id, identity); record.id = id;
  if (!lexicon.has(id)) lexicon.set(id, record);
}
writeFileSync(source, csv([["lexeme_id", ...headers], ...records.map(record => [record.id, ...record.row])]), "utf8");
const languageRoot = resolve(source, "..", "..");
writeFileSync(resolve(languageRoot, "lexicon.csv"), csv([["lexeme_id","english","target","article","pos","sense","level","rank","tags"], ...[...lexicon.values()].map(record => [record.id,record.english,record.target,"","","","",record.index + 1,"core-3000"])]), "utf8");
writeFileSync(resolve(languageRoot, "aliases.csv"), csv([["old_lexeme_id","canonical_lexeme_id"]]), "utf8");
console.log(`Built ${lexicon.size} ${language} lexemes for ${records.length} rows.`);
