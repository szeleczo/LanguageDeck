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
assert.match(indexHtml, /id="grammarCourseHost"/, "Grammar & Forms has a dedicated curriculum surface");
assert.match(indexHtml, /data-grammar-course.*openGrammarCourse/s, "Practice Grammar opens the curriculum instead of an unstructured deck");
assert.match(indexHtml, /data-story-variant="match"/, "story vocabulary exposes Word Match");
assert.match(indexHtml, /data-story-variant="typing"/, "story vocabulary exposes typed recall");
assert.match(indexHtml, /data-practice-tool="import"/, "My library exposes imports in Practice");
assert.match(indexHtml, /data-practice-tool="manage"/, "My library exposes installed deck management");
assert.match(indexHtml, /data-practice-tool="sync"/, "My library exposes progress sync");
assert.match(indexHtml, /morePracticeOptionsBtn/, "advanced controls remain reachable from session settings");
assert.match(indexHtml, /p === "stories" \|\| p === "texts"/, "course and book files stay out of the standalone deck browser");
assert.match(indexHtml, /unit\.lexiconFile.*unitLexicon.*lexicon:/s, "story units can load their own isolated lexicon");
assert.match(indexHtml, /\["memorise","grammar_recall"\].*guided_full_recall_at/, "grammar mastery requires item-specific full recall evidence");
assert.match(indexHtml, /PRACTICE_RETURN_VIEW==='grammar-course'/, "completed grammar phases return to their unit");

const languages = JSON.parse(text(join(root, "decks", "languages.json")));
assert.deepEqual(languages.languages.map(language => language.code), ["de", "it"], "German and Italian remain registered");
const italianManifest = JSON.parse(text(join(root, "decks", "it", "manifest.json")));
assert.deepEqual(italianManifest.catalogPackages[0].actions.map(action => action.variant), ["match", "progressive", "typing"], "Italian words keep every word mode");
const germanManifest = JSON.parse(text(join(deRoot, "manifest.json")));
const wordVariants = new Set(germanManifest.catalogPackages.flatMap(pack => pack.actions).filter(action => action.mode === "words").map(action => action.variant));
const sentenceVariants = new Set(germanManifest.catalogPackages.flatMap(pack => pack.actions).filter(action => ["grammar", "sentences"].includes(action.mode)).map(action => action.variant));
assert.deepEqual([...wordVariants].sort(), ["match", "progressive", "typing"], "German word packages keep Match, Adaptive and Type");
assert.deepEqual([...sentenceVariants].sort(), ["choice", "order", "progressive", "typing"], "sentence engines keep Choice, Reorder, Adaptive and Type");
const standaloneIndex = JSON.parse(text(join(root, "decks", "index.json")));
assert.equal(standaloneIndex.length, 8, "the standalone browser contains only independent practice decks");
assert.ok(standaloneIndex.every(deck => !/[\\/]stories[\\/]|[\\/]texts[\\/]/.test(deck.file || "")), "story files never leak into the standalone browser");

const curriculum = JSON.parse(text(join(deRoot, "grammar", "core-curriculum.json")));
assert.equal(curriculum.explanationLanguage, "hu", "grammar explanations are Hungarian");
assert.equal(curriculum.targetLanguage, "de", "grammar production remains German");
assert.equal(curriculum.units.length, 10, "the first Grammar & Forms curriculum has ten units");
const requiredUnits = ["praesens-questions", "perfekt", "praeteritum", "past-future", "imperative-negation", "konjunktiv-two", "modal-verbs", "separable-reflexive", "comparison", "passive"];
assert.deepEqual(curriculum.units.map(unit => unit.id), requiredUnits, "the core curriculum covers the approved A1-B1 sequence");
const grammarGoalIds = new Set();
let grammarGoalCount = 0;
for (const unit of curriculum.units) {
  assert.ok(unit.rule && unit.examples?.length >= 2, `${unit.id} needs a concise rule and examples`);
  assert.deepEqual(unit.phases.map(phase => phase.id), ["forms", "sentences"], `${unit.id} needs form and sentence recall`);
  for (const phase of unit.phases) {
    assert.equal(phase.rows.length, 5, `${unit.id}/${phase.id} needs five balanced targets`);
    for (const row of phase.rows) {
      const key = `${unit.id}:${phase.id}:${row.key}`;
      assert.ok(!grammarGoalIds.has(key), `duplicate grammar goal ${key}`);
      grammarGoalIds.add(key); grammarGoalCount++;
      assert.ok(row.prompt && row.target && row.explanation, `${key} needs prompt, target and explanation`);
    }
  }
}
assert.equal(grammarGoalCount, 100, "the core curriculum contains 100 active-recall goals");

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
  "stories/ein-skandal-in-boehmen/story.json",
  "stories/tschick/story.json"
].map(file => JSON.parse(text(join(deRoot, file))));
const firstChapters = stories.map(story => story.chapters.find(chapter => chapter.id === "ch01"));
const cache = new Map();
const counts = firstChapters.map(chapter => loadChapterCount(chapter, cache));
assert.deepEqual(counts, [274, 29, 72, 71], "same-named chapters retain their own sentence data");
assert.equal(cache.size, 4, "same-named chapters receive distinct cache entries");
assert.equal(stories[3].chapters.length, 4, "Tschick is a four-part isolated course");

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
  const localUnit = file.match(/^(.*[\\/]texts[\\/]de-tschick-\d+)[\\/]/);
  const allowedIds = new Set(canonicalIds);
  if (localUnit) {
    const localLexicon = join(localUnit[1], "lexicon.csv");
    if (existsSync(localLexicon)) for (const row of parseCsv(text(localLexicon))) if (row.lexeme_id) allowedIds.add(row.lexeme_id);
  }
  for (const row of parseCsv(text(file))) {
    if (!row.lexeme_id || row.lexeme_id.startsWith("de.private.")) continue;
    const resolved = canonical(row.lexeme_id);
    assert.ok(allowedIds.has(resolved), `${relative(root, file)} references missing lexeme ${row.lexeme_id}`);
  }
}

const serviceWorker = text(join(root, "sw.js"));
assert.match(serviceWorker, /languagedeck-3-2-1-capability-restoration-20260813/, "service worker cache version is current");
assert.match(serviceWorker, /decks\/de\/grammar\/core-curriculum\.json/, "the grammar curriculum is available offline");
assert.match(serviceWorker, /decks\/it\/words\/core-3000\.csv/, "Italian vocabulary is available offline");
assert.match(serviceWorker, /decks\/de\/stories\/tschick\/story\.json/, "Tschick course metadata is available offline");
const shellMatch = serviceWorker.match(/const APP_SHELL=\[([\s\S]*?)\];/);
assert.ok(shellMatch, "service worker declares an app shell");
for (const item of shellMatch[1].matchAll(/"([^"]+)"/g)) {
  assert.ok(existsSync(join(root, item[1].replace(/^\.\//, ""))), `service worker shell is missing ${item[1]}`);
}
assert.ok(!existsSync(join(root, "practice.html")), "duplicate standalone Practice page was removed");
assert.ok(!existsSync(join(root, "story-study.html")), "duplicate standalone Story Study page was removed");
assert.ok(!existsSync(join(root, "index.json")), "orphan root CSV disguised as JSON was removed");
assert.ok(!existsSync(join(root, "PRIVATE_CONTENT_NOTICE.txt")), "obsolete private-only notice was removed");
assert.ok(!walk(deRoot).some(file => /texts[\\/]maja-k01[\\/]/i.test(file)), "Maja is not shipped");
assert.ok(!walk(deRoot).some(file => /texts[\\/]sterntaler[\\/]/i.test(file)), "Sterntaler is not shipped");
assert.ok(!walk(root).some(file => /RELEASE_NOTES/i.test(file)), "release-note files are not shipped");
console.log(`Integrity verified: ${lexicon.length} canonical lexemes, ${aliases.length} aliases, ${cache.size} isolated ch01 cache entries, ${grammarGoalCount} grammar goals.`);
