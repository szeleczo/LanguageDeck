import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const deRoot = join(root, "decks", "de");
const text = file => readFileSync(file, "utf8");

function parseCsv(source) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  const [headers = [], ...body] = rows;
  return body.filter(row => row.some(Boolean)).map(row => Object.fromEntries(headers.map((key, i) => [key, row[i] || ""])));
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

const indexHtml = text(join(root, "index.html"));
assert.match(indexHtml, /function chapterCacheKey\(ch\).*unitId.*folder/, "chapter cache requires a stable unitId or folder");
assert.match(indexHtml, /CHAPTER_DATA\.set\(key,x\)/, "chapter writes use the derived cache key");
assert.ok(!indexHtml.includes("CHAPTER_DATA.get(ch.id)"), "no direct chapter-id cache reads remain");
assert.ok(!indexHtml.includes("CHAPTER_DATA.set(ch.id"), "no direct chapter-id cache writes remain");
assert.match(indexHtml, /<aside class="context-rail hidden" id="contextRail">/, "word gloss uses a docked contextual rail");
assert.match(indexHtml, /activeGlossId=id;openedSentence=new Set\(\[id\]\)/, "a word tap updates only the active gloss");
assert.match(indexHtml, /k\.explicitUnknownAt=Date\.now\(\);k\.excluded=false;k\.handedOff=false/, "a tapped unknown is locked back into learning");
assert.match(indexHtml, /explicitUnknownPending\(state\).*priority:1000/s, "explicit unknown words join the chapter learning plan");
assert.match(indexHtml, /guided_full_recall_at.*explicit_unknown_at/, "guided memorisation requires item-specific full recall evidence");
assert.match(indexHtml, /guided_attempts.*guided_last_answer_at.*times_wrong/s, "guided selection is ordered by least practice first");
assert.match(indexHtml, /languagedeck:guided-phase-complete/, "completed guided phases return automatically");
assert.ok(!indexHtml.includes('const INLINE_KEYPAD_PUNCTUATION = [".", ","'), "optional comma keys no longer create a keypad row");
assert.match(indexHtml, /inline-keypad button\.inline-keypad-key[\s\S]*?min-height:\s*46px/, "main QWERTZ keys keep a 46px touch height");
assert.match(indexHtml, /gap:\s*1\.5px/, "keyboard gaps leave more width for letter keys");
assert.match(indexHtml, /document\.elementFromPoint\(e\.clientX,e\.clientY\)/, "drag correction follows the key under the pointer");
assert.match(indexHtml, /chosen\._keyAction\?\.\(\)/, "main keyboard commits the release-time key");
assert.match(indexHtml, /data-text-key[\s\S]*?slideCommit/, "Text Study keyboard suppresses duplicate pointer clicks");
assert.match(indexHtml, /bindLetterBankSlide\(bank\)/, "letter-bank tasks share slide correction");

const optionalRecallNorm = value => String(value || "").toLocaleLowerCase().replace(/[,\.!?;:]+/gu, "").replace(/\s+/g, " ").trim();
assert.equal(optionalRecallNorm("jemanden bitten, zu bleiben"), optionalRecallNorm("jemanden bitten zu bleiben"), "comma-free recall is accepted");
assert.notEqual(optionalRecallNorm("kennenlernen"), optionalRecallNorm("kennen lernen"), "punctuation leniency does not collapse word boundaries");

const guidedRows = [
  { id: 1, streak: 9, guided_attempts: 2 },
  { id: 2, streak: 5, guided_attempts: 0 },
  { id: 3, streak: 7, guided_attempts: 1 }
];
const guidedDone = row => +(row.guided_full_recall_at || 0) > +(row.explicit_unknown_at || 0);
assert.equal(guidedRows.filter(guidedDone).length, 0, "legacy streaks cannot silently complete memorisation");
guidedRows.forEach((row, i) => { row.guided_full_recall_at = 100 + i; });
assert.equal(guidedRows.filter(guidedDone).length, 3, "every item needs its own full-recall proof");
guidedRows[1].explicit_unknown_at = 1000;
assert.equal(guidedDone(guidedRows[1]), false, "a later unknown tap invalidates an older recall proof");
assert.deepEqual([...guidedRows].sort((a,b)=>(a.guided_attempts|0)-(b.guided_attempts|0)).map(row=>row.id), [2,3,1], "least-practised guided items rotate first");

function chapterCacheKey(ch) {
  if (String(ch.unitId || "").trim()) return `unit:${ch.unitId.trim()}`;
  if (String(ch.folder || "").trim()) return `folder:${ch.folder.trim()}`;
  throw new Error(`Chapter ${ch.id || "(unknown)"} has no cache identity.`);
}

function loadChapterCount(chapter, cache) {
  const key = chapterCacheKey(chapter);
  if (cache.has(key)) return cache.get(key);
  const base = join(deRoot, chapter.folder);
  const unit = JSON.parse(text(join(base, "unit.json")));
  const count = parseCsv(text(join(base, unit.sentenceFile || "sentences.csv"))).length;
  cache.set(key, count);
  return count;
}

const stories = [
  "stories/ein-skandal-in-boehmen-extended/story.json",
  "stories/baker-street-launchpad/story.json",
  "stories/ein-skandal-in-boehmen/story.json"
].map(file => JSON.parse(text(join(deRoot, file))));
const firstChapters = stories.map(story => story.chapters.find(chapter => chapter.id === "ch01"));
const cache = new Map();
const counts = firstChapters.map(chapter => loadChapterCount(chapter, cache));
assert.deepEqual(counts, [274, 29, 72], "same-named chapters retain their own sentence data");
assert.equal(cache.size, 3, "same-named chapters receive distinct cache entries");

const lexicon = parseCsv(text(join(deRoot, "lexicon.csv")));
const canonicalIds = new Set(lexicon.map(row => row.lexeme_id));
assert.equal(canonicalIds.size, lexicon.length, "canonical lexeme IDs are unique");
for (const id of canonicalIds) {
  const generated = id.match(/^(.*)-(\d+)$/);
  assert.ok(!generated || !canonicalIds.has(generated[1]), `generated duplicate suffix remains: ${id}`);
}

const aliases = parseCsv(text(join(deRoot, "aliases.csv")));
const aliasMap = new Map();
for (const row of aliases) {
  assert.ok(row.old_lexeme_id && row.canonical_lexeme_id, "aliases need both identifiers");
  assert.ok(!aliasMap.has(row.old_lexeme_id), `duplicate alias key: ${row.old_lexeme_id}`);
  aliasMap.set(row.old_lexeme_id, row.canonical_lexeme_id);
}
function canonical(id) {
  const seen = new Set();
  let current = id;
  while (aliasMap.has(current)) {
    assert.ok(!seen.has(current), `alias cycle at ${current}`);
    seen.add(current);
    current = aliasMap.get(current);
  }
  return current;
}
for (const [oldId, target] of aliasMap) {
  assert.ok(canonicalIds.has(canonical(target)), `alias target is missing: ${oldId} -> ${target}`);
}

const expectedMigrations = new Map([
  ["de.lex.aufstehen.get-up-2", "de.lex.aufstehen.get-up"],
  ["de.lex.cafe.cafe-2", "de.lex.cafe.cafe"],
  ["de.lex.das-kommt-darauf-an.that-depends-2", "de.lex.das-kommt-darauf-an.that-depends"],
  ["de.lex.decke.blanket", "de.lex.decke.ceiling"],
  ["de.lex.decke.blanket-2", "de.lex.decke.blanket-covering"],
  ["de.lex.gesundheit-2", "de.lex.gesundheit.bless-you"],
  ["de.lex.glueck.happiness", "de.lex.glueck.luck-chance"],
  ["de.lex.glueck.happiness-2", "de.lex.glueck.happiness-wellbeing"],
  ["de.lex.guten-tag-2", "de.lex.guten-tag"],
  ["de.lex.ich-habe-gegessen-2", "de.lex.ich-habe-gegessen"],
  ["de.lex.rezept.prescription", "de.lex.rezept.recipe-cooking"],
  ["de.lex.rezept.prescription-2", "de.lex.rezept.prescription-medical"],
  ["de.lex.salat.lettuce", "de.lex.salat.salad-dish"],
  ["de.lex.salat.lettuce-2", "de.lex.salat.lettuce-plant"],
  ["de.lex.schritt-fuer-schritt-2", "de.lex.schritt-fuer-schritt"],
  ["de.lex.sie.her-2", "de.lex.sie.her"],
  ["de.lex.uhr.clock-2", "de.lex.uhr.clock"]
]);
for (const [oldId, newId] of expectedMigrations) {
  assert.equal(canonical(oldId), newId, `legacy knowledge must migrate: ${oldId}`);
}

for (const file of walk(deRoot).filter(file => file.endsWith(".csv") && !file.endsWith("aliases.csv"))) {
  for (const row of parseCsv(text(file))) {
    if (!row.lexeme_id || row.lexeme_id.startsWith("de.private.")) continue;
    const resolved = canonical(row.lexeme_id);
    assert.ok(canonicalIds.has(resolved), `${relative(root, file)} references missing lexeme ${row.lexeme_id}`);
  }
}

const serviceWorker = text(join(root, "sw.js"));
assert.match(serviceWorker, /languagedeck-3-1-8-keyboard-ergonomics-20260811/, "service worker cache version is current");
const shellMatch = serviceWorker.match(/const APP_SHELL=\[([\s\S]*?)\];/);
assert.ok(shellMatch, "service worker declares an app shell");
for (const item of shellMatch[1].matchAll(/"([^"]+)"/g)) {
  assert.ok(existsSync(join(root, item[1].replace(/^\.\//, ""))), `service worker shell is missing ${item[1]}`);
}
console.log(`Integrity verified: ${lexicon.length} canonical lexemes, ${aliases.length} aliases, ${cache.size} isolated ch01 cache entries.`);
