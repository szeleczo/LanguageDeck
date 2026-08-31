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
for (const [index, script] of [...indexHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
  assert.doesNotThrow(() => new Function(script[1]), `inline script ${index + 1} is valid JavaScript`);
}
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
assert.match(indexHtml, /inline-keypad button\.inline-keypad-key[\s\S]*?min-height:\s*46px/, "main configured keypad keys keep a 46px touch height");
assert.match(indexHtml, /gap:\s*1\.5px/, "keyboard gaps leave more width for letter keys");
assert.match(indexHtml, /const dockedKeypadMode = keyboardConfig\(\)\.mode === "inline" && isTouchPrimaryDevice\(\)[\s\S]*wordMode === "typing"[\s\S]*sentenceMode === "typing"/, "regular word and sentence typing keep the configured global touch keypad docked");
assert.match(indexHtml, /typingKeypadActivators\[0\]\?\.\(\)/, "sentence typing binds the keypad to the first blank immediately");
assert.match(indexHtml, /inp\.classList\.add\("keypad-input-active"\)/, "the first bound sentence blank is visibly active without a tap");
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
assert.match(indexHtml, /spec\.target === "grammar_skill"[\s\S]*guidedSkillDone/, "grammar mastery is calculated from skill evidence");
assert.match(indexHtml, /skill_stage:phase\.requireTransfer\?'transfer':\(row\.stage\|\|phase\.stage\|\|''\)/, "transfer-required grammar phases emit transfer evidence instead of impossible control-only evidence");
assert.match(indexHtml, /const transferRows = skillRows\.filter[\s\S]*spec\?\.requireTransfer && transferRows\.length/, "malformed legacy guided specs cannot create an endless transfer loop");
assert.match(indexHtml, /"guided_attempts", "guided_last_answer_at", "guided_success_at"/, "guided success evidence is mirrored into the active and queued cards");
assert.match(indexHtml, /async function pruneCompletedGuidedQueue[\s\S]*guidedSkillDone[\s\S]*ensureWordQueue[\s\S]*pruneCompletedGuidedQueue\("word_pairs"[\s\S]*ensureSentenceQueue[\s\S]*pruneCompletedGuidedQueue\("sentence_pairs"/, "completed grammar skills are removed from already-prefetched queues");
assert.match(indexHtml, /PRACTICE_RETURN_VIEW==='grammar-course'/, "completed grammar phases return to their unit");
assert.match(indexHtml, /button\.blank-chip\{[\s\S]*?background:\s*var\(--surface-2\)[\s\S]*?color:\s*var\(--text\)[\s\S]*?border:\s*1px dashed/s, "sentence answer slots fully override the generic primary-button skin");
assert.match(indexHtml, /4\.3\.1-practice-transition-recovery-20260831/, "the application build marker includes the 4.3.1 transition-recovery release");
assert.equal((indexHtml.match(/4\.3\.1-practice-transition-recovery-20260831/g) || []).length, 2, "Course and Practice use the same 4.3.1 build marker");
assert.match(indexHtml, /KNOWLEDGE_SCHEMA_VERSION=3/, "shared lexical knowledge has an explicit schema");
assert.match(indexHtml, /KNOWLEDGE_CHANNELS=\["reading","words","grammar_context"\]/, "course, word practice and grammar context retain separate evidence channels");
assert.match(indexHtml, /strength:1,sourceMode:"grammar"/, "grammar context can only mark a lexeme as encountered");
assert.match(indexHtml, /if \(!isCurrentSentenceCorrect\(\)\)[\s\S]*Még nem jó[\s\S]*return;[\s\S]*submitSentenceAnswer\(false\)/, "choice exercises auto-submit only a correct completed answer");
assert.match(indexHtml, /async function advanceAfterCorrectSentence\(\)[\s\S]*try \{[\s\S]*loadNextSentence\(\)[\s\S]*catch \(error\)[\s\S]*feedbackAwaitingContinue = true[\s\S]*finally \{[\s\S]*locked = false[\s\S]*updateSentenceActionButtons\(\)/, "a failed next-card load always unlocks the practice UI and offers a retry");
assert.match(indexHtml, /Promise\.allSettled\(\[refreshStats\(\), refreshGateInfo\(\)\]\)/, "non-critical statistics refresh cannot block the next practice card");
assert.match(indexHtml, /Could not save the correct sentence answer[\s\S]*locked = false;[\s\S]*updateSentenceActionButtons\(\);[\s\S]*return;/, "a failed answer write cannot leave the practice UI locked");
assert.match(indexHtml, /async function advanceAfterCorrectWord\(\)[\s\S]*catch \(error\)[\s\S]*wordTypingAwaitingContinue = true[\s\S]*finally \{[\s\S]*locked = false[\s\S]*updateTypingActionButtons\(\)/, "word-card transitions receive the same unlock-and-retry protection");
assert.ok(!/setTimeout\(async \(\) => \{ locked = false; if \(currentGame === "combined"\)/.test(indexHtml), "correct word and sentence transitions do not use unguarded async timers");
assert.ok(!indexHtml.includes("leadingGermanArticle"), "all article parsing uses the configured language helper");
assert.match(indexHtml, /leadingConfiguredArticle\(target, currentDeck\)/, "Word Match uses the configured article parser");
assert.match(indexHtml, /data-catalog-language="\$\{esc\(LANG\)\}"/, "every catalog button carries the language that rendered it");
assert.match(indexHtml, /startCatalogIntegrated\(\{\.\.\.a,language:b\.dataset\.catalogLanguage\}\)/, "the catalog forwards that exact rendered language");
assert.match(indexHtml, /let catalogSessionSerial = 0/, "the practice engine serializes catalog launches");
assert.match(indexHtml, /async function startCatalogPractice\(spec=\{\}\)\{[\s\S]*?await init\(requested\)[\s\S]*?const session = catalogSessionRequest\(spec\)[\s\S]*?applyCatalogSession\(session,setName\)[\s\S]*?catalogSessionMatches\(session,setName\)/, "catalog launches restore saved settings first, then commit one explicit language/mode/deck contract");
assert.match(indexHtml, /deckPrefix !== language/, "a catalog action cannot pair a deck with another installed language");
assert.ok(!/if\s*\(fetchingMore\)\s*return\s*\[\];/.test(indexHtml), "fetchWordItems/fetchSentenceItems no longer share a boolean guard that silently drops a concurrent fetch");
assert.match(indexHtml, /wordFetchInFlight/, "fetchWordItems uses its own in-flight promise instead of the shared fetchingMore flag");
assert.match(indexHtml, /sentenceFetchInFlight/, "fetchSentenceItems uses its own in-flight promise instead of the shared fetchingMore flag");
assert.match(indexHtml, /skillRows\.reduce\(\(n, row\) => n \+ Math\.min\(\+\(row\.streak \|\| 0\), needed\), 0\)/, "guidedSkillDone requires repeated correct answers via the row's own streak, not a one-time success flag");

const languages = JSON.parse(text(join(root, "decks", "languages.json")));
assert.equal(languages.schemaVersion, 2, "the language registry points to one canonical per-language configuration");
assert.deepEqual(languages.languages.map(language => language.code), ["de", "it"], "German and Italian remain registered");
assert.ok(languages.languages.every(language => language.config && language.manifest), "registry entries contain paths, not duplicate language settings");
const languageConfigs = new Map(languages.languages.map(entry => [entry.code, JSON.parse(text(join(root, "decks", entry.config)))]));
const germanLanguage = languageConfigs.get("de"), italianLanguage = languageConfigs.get("it");
assert.equal(germanLanguage.schemaVersion, 3, "German uses the shared-knowledge language configuration schema");
assert.equal(italianLanguage.schemaVersion, 3, "Italian uses the shared-knowledge language configuration schema");
assert.ok([...languageConfigs.values()].every(config => config.knowledge?.schemaVersion === 3 && config.knowledge.lexicon && config.knowledge.aliases), "every installed language declares its own lexicon namespace");
assert.deepEqual(germanLanguage.keyboard.rows, ["qwertzuiopü", "asdfghjklöä", "yxcvbnmß"], "German keeps its established touch-keypad layout in data");
assert.deepEqual(italianLanguage.keyboard.rows, ["qwertyuiopè", "asdfghjklòàù", "zxcvbnmì"], "Italian has its own in-app QWERTY keypad layout");
assert.ok([...languageConfigs.values()].every(config => config.keyboard?.mode === "inline" && config.keyboard.rows?.length), "every installed language package supplies its own in-app keyboard");
assert.equal(italianLanguage.articleParsing.mode, "none", "article-specific import parsing is opt-in per language");
assert.ok(germanLanguage.capabilities.grammarCurriculum, "Grammar availability is declared by the language package");
assert.match(indexHtml, /entry\.config \? await fetchOptionalJson\(`decks\/\$\{entry\.config\}`\)/, "Practice loads each language configuration before use");
assert.match(indexHtml, /keyboardConfig\(\)\.mode === "inline"/, "both touch keypad decisions read the language configuration");
assert.match(indexHtml, /activeLanguage\.capabilities\?\.grammarCurriculum/, "the curriculum card is capability-driven rather than tied to a language code");
assert.match(indexHtml, /path=cfg\.capabilities\?\.grammarCurriculum/, "the curriculum loader uses the configured path");
assert.match(indexHtml, /function portableSlug\(/, "fallback identifiers use a portable Unicode-safe slug");
assert.match(indexHtml, /function portableLexemeSuffix\(/, "Text Study fallback lexeme IDs keep non-Latin forms distinct");
assert.match(indexHtml, /function contentTypeTerms\(/, "legacy import set names use configured content-type synonyms");
assert.ok(!indexHtml.includes('mode: "native"'), "the app never falls back to the device keyboard");
assert.ok(!indexHtml.includes("qwertz"), "the app code contains no embedded German keypad layout");
assert.ok(!indexHtml.includes("de-DE"), "the app code contains no embedded German comparison locale");
assert.ok(!indexHtml.includes("decks/de/"), "the app code contains no unscoped German deck path");
assert.ok(!/LANG\s*={2,3}\s*["']de["']/.test(indexHtml), "the app does not gate a feature on a German language code");
const portableKey = value => (String(value).normalize("NFKC").match(/[\p{L}\p{N}]+/gu) || []).map(part => Array.from(part).map(ch => ch.codePointAt(0).toString(36)).join("_")).join("-") || "item";
assert.notEqual(portableKey("日本語"), portableKey("русский"), "portable fallback keys preserve distinct non-Latin content");
const appManifest = JSON.parse(text(join(root, "manifest.webmanifest")));
assert.equal(appManifest.name, "LanguageDeck", "the install name stays stable across releases");
assert.equal(appManifest.id, "./?app=LanguageDeck-v3.3.2", "the established PWA identity stays stable so updates retain progress");
assert.equal(appManifest.theme_color, "#111827", "the native launch surface uses the new dark brand colour");
assert.equal(appManifest.background_color, "#111827", "the PWA splash background matches the application icon");
assert.ok(appManifest.icons.some(icon => icon.purpose === "maskable" && icon.src === "icon-maskable-512.png"), "Android receives a dedicated maskable icon");
assert.match(indexHtml, /rel="apple-touch-icon"/, "Apple home-screen installs receive the same brand icon");
const appIcon = text(join(root, "icon.svg"));
assert.match(appIcon, /M168 176v105/, "the current UI U-mark is the canonical application icon");
assert.ok(!appIcon.includes("C 38.5 57.8"), "the obsolete head silhouette is no longer shipped as the primary icon");
const italianManifest = JSON.parse(text(join(root, "decks", "it", "manifest.json")));
assert.deepEqual(italianManifest.catalogPackages[0].actions.map(action => action.variant), ["match", "progressive", "typing"], "Italian words keep every word mode");
const germanManifest = JSON.parse(text(join(deRoot, "manifest.json")));
for (const [language, manifest] of [["de", germanManifest], ["it", italianManifest]]) {
  for (const action of manifest.catalogPackages.flatMap(pack => pack.actions || [])) {
    assert.ok(String(action.deckId || "").startsWith(`${language}-`), `${language} catalog action ${action.label} points only to its own deck`);
    assert.ok(["words", "grammar", "sentences"].includes(action.mode), `${language} catalog action has a supported mode`);
    assert.ok(action.variant, `${language} catalog action declares an explicit variant`);
  }
}
const wordVariants = new Set(germanManifest.catalogPackages.flatMap(pack => pack.actions).filter(action => action.mode === "words").map(action => action.variant));
const sentenceVariants = new Set(germanManifest.catalogPackages.flatMap(pack => pack.actions).filter(action => ["grammar", "sentences"].includes(action.mode)).map(action => action.variant));
assert.deepEqual([...wordVariants].sort(), ["match", "progressive", "typing"], "German word packages keep Match, Adaptive and Type");
assert.deepEqual([...sentenceVariants].sort(), ["choice", "order", "progressive", "typing"], "sentence engines keep Choice, Reorder, Adaptive and Type");
const standaloneIndex = JSON.parse(text(join(root, "decks", "index.json")));
assert.equal(standaloneIndex.length, 8, "the standalone browser contains only independent practice decks");
assert.ok(standaloneIndex.every(deck => !/[\\/]stories[\\/]|[\\/]texts[\\/]/.test(deck.file || "")), "story files never leak into the standalone browser");

const curriculum = JSON.parse(text(join(deRoot, "grammar", "curriculum-v4.json")));
assert.equal(curriculum.schemaVersion, 4, "Grammar & Forms uses the v4 curriculum schema");
assert.equal(curriculum.curriculumVersion, "4.2.2", "the curriculum identifies the 4.2.2 grammar-prompt-context release");
assert.equal(curriculum.explanationLanguage, "hu", "grammar explanations are Hungarian");
assert.equal(curriculum.targetLanguage, "de", "grammar production remains German");
assert.deepEqual(curriculum.tracks.map(track => track.id), ["a1-foundation", "a1-expansion", "a2-connection", "b1-expression", "b2-precision"], "the curriculum spirals through five CEFR stage bands up to B2");
assert.equal(curriculum.units.length, 60, "the sixty source units (fifty-seven original plus the three adjective-declension units added in 4.2.1) remain available as a hidden task bank");
assert.deepEqual(curriculum.units.map(unit => unit.order).sort((a, b) => a - b), Array.from({length:60}, (_, i) => i + 1), "unit order is stable and globally contiguous across every track");
const requiredUnits = ["sentence-core", "noun-gender-plural", "nouns-nominative-accusative", "dative-recipient", "perfect-foundation", "two-way-prepositions", "fixed-prepositions", "modal-system", "verb-government", "object-order", "subordinate-clauses", "preterite-narration", "adjective-comparison", "adjective-weak", "adjective-mixed", "adjective-strong", "reflexive-and-nicht", "konjunktiv-two", "relative-clauses", "infinitive-clauses", "passive", "prepositional-verbs", "past-sequence", "genitive", "final-transfer"];
for (const id of requiredUnits) assert.ok(curriculum.units.some(unit => unit.id === id), `curriculum is missing ${id}`);
const requiredB2Units = ["b2-complex-connectors", "b2-indirect-speech", "b2-advanced-passive", "b2-relative-precision", "b2-nominalisation", "b2-participial-adjectives", "b2-word-order-focus", "b2-register-modality", "b2-final-transfer"];
for (const id of requiredB2Units) assert.ok(curriculum.units.some(unit => unit.id === id), `B2 curriculum is missing ${id}`);
assert.equal(curriculum.units.filter(unit => unit.progressSetName?.startsWith("Grammar 4 ·") && !unit.progressSetName.includes("v4.1")).length, 36, "the original 33 units retain their exact legacy progress set identity, plus the 3 new adjective-declension units that adopted the same naming pattern");
const expectedModuleIds = ["sentence-present", "verb-system", "akkusativ-dativ", "noun-system", "time-system", "word-order", "mood-voice", "b2-precision"];
assert.deepEqual(curriculum.modules.map(module => module.id), expectedModuleIds, "the learner sees eight coherent grammar modules in a stable order");
assert.deepEqual(curriculum.modules.map(module => module.order), Array.from({length:8}, (_, i) => i + 1), "module order is stable and contiguous");
const sourceUnitAssignments = curriculum.modules.flatMap(module => module.sourceUnits.map(unitId => [unitId, module.id]));
assert.equal(sourceUnitAssignments.length, curriculum.units.length, "every hidden source unit belongs to exactly one visible module");
assert.equal(new Set(sourceUnitAssignments.map(([unitId]) => unitId)).size, curriculum.units.length, "no hidden source unit appears in two modules");
for (const [unitId, moduleId] of sourceUnitAssignments) assert.ok(curriculum.units.some(unit => unit.id === unitId), `${moduleId} references missing source unit ${unitId}`);
const unitsById = new Map(curriculum.units.map(unit => [unit.id, unit]));
const practiceRows = (module, practiceSet) => module.sourceUnits.flatMap(unitId => {
  const unit = unitsById.get(unitId);
  return unit.phases.filter(phase => phase.variant === practiceSet.variant).flatMap(phase => phase.rows.map(row => ({ unit, phase, row })));
});
let visiblePracticeRowCount = 0;
for (const module of curriculum.modules) for (const practiceSet of module.practiceSets) {
  const rows = practiceRows(module, practiceSet);
  assert.ok(rows.length, `${module.id}/${practiceSet.id} needs at least one task`);
  visiblePracticeRowCount += rows.length;
}
assert.equal(visiblePracticeRowCount, 621, "the compact modules expose a reviewed subset of 621 source tasks");
let focusedPracticeRowCount = 0;
for (const module of curriculum.modules) for (const practiceSet of module.practiceSets.filter(set => set.focusOnly)) {
  for (const {unit, phase, row} of practiceRows(module, practiceSet)) {
    focusedPracticeRowCount++;
    const focus = String(Array.isArray(row.focus) ? row.focus.join("|") : row.focus || "").split("|").map(value => value.trim()).filter(Boolean);
    const options = Array.isArray(row.options) ? row.options : String(row.options || "").split("|").filter(Boolean);
    const key = `${unit.id}/${phase.id}/${row.key}`;
    assert.ok(focus.length && focus.every(value => row.target.toLocaleLowerCase("de-DE").includes(value.toLocaleLowerCase("de-DE"))), `${key} must visibly contain every measured form`);
    if (practiceSet.variant === "choice") assert.ok(options.length >= 2, `${key} needs at least two targeted choices`);
    if (practiceSet.variant === "choice" && focus.some(value => /\s/u.test(value))) assert.ok(options.includes(row.target), `${key} whole-answer choices must offer the complete correct answer`);
  }
}
assert.equal(focusedPracticeRowCount, 541, "all 541 focused module tasks pass the target contract");
const caseModule = curriculum.modules.find(module => module.id === "akkusativ-dativ");
assert.equal(caseModule.practiceSets.length, 1, "Akkusativ and Dativ have one uninterrupted targeted practice path");
const caseSet = caseModule.practiceSets[0];
assert.deepEqual(
  { variant:caseSet.variant, focusOnly:caseSet.focusOnly, singleTarget:caseSet.singleTarget },
  { variant:"choice", focusOnly:true, singleTarget:true },
  "case practice uses one-target choices only"
);
const caseRows = practiceRows(caseModule, caseSet);
assert.equal(caseRows.length, 66, "the case module contains sixty-six focused decisions");
assert.equal(new Set(caseRows.map(({row}) => row.skillId)).size, 31, "the case module covers thirty-one distinct case skills");
for (const {unit, phase, row} of caseRows) {
  const focus = String(Array.isArray(row.focus) ? row.focus.join("|") : row.focus || "").split("|").map(value => value.trim()).filter(Boolean);
  const options = Array.isArray(row.options) ? row.options : String(row.options || "").split("|").filter(Boolean);
  const key = `${unit.id}/${phase.id}/${row.key}`;
  assert.equal(focus.length, 1, `${key} must measure exactly one visible case form`);
  assert.ok(options.length >= 2 && options.includes(focus[0]), `${key} needs a targeted choice bank containing the answer`);
  const escaped = focus[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const occurrences = [...row.target.matchAll(new RegExp(`(?<![\\p{L}\\p{M}])${escaped}(?![\\p{L}\\p{M}])`, "gu"))].length;
  assert.equal(occurrences, 1, `${key} must blank only its single case-bearing target`);
}
assert.ok(caseRows.every(({phase}) => phase.variant === "choice"), "case practice excludes unrelated typing and sentence-order assessment");
const dativeRecipientControl = unitsById.get("dative-recipient").phases.find(phase => phase.id === "forms").rows;
assert.ok(dativeRecipientControl.some(row => row.key === "to-guests" && row.focus === "den" && row.skillId === "dative.plural.article"), "plural Dativ article choice is measured separately");
assert.ok(dativeRecipientControl.some(row => row.key === "with-children-n" && row.focus === "Kindern" && row.skillId === "dative.plural.n"), "plural Dativ noun ending is measured separately");
const grammarGoalIds = new Set();
const skillIds = new Set();
let grammarGoalCount = 0;
for (const unit of curriculum.units) {
  assert.ok(unit.rule && unit.examples?.length >= 2, `${unit.id} needs a rule and contrasted examples`);
  assert.equal(unit.phases.length, 3, `${unit.id} needs recognition/control/transfer progression`);
  for (const phase of unit.phases) {
    assert.ok(["choice", "typing", "order", "progressive"].includes(phase.variant), `${unit.id}/${phase.id} uses an approved task engine`);
    if (phase.sequence === false) assert.equal(phase.id, "production", `${unit.id}/${phase.id} may shuffle only in final production`);
    else assert.equal(phase.sequence, true, `${unit.id}/${phase.id} keeps pedagogical order`);
    for (const row of phase.rows) {
      const key = `${unit.id}:${phase.id}:${row.key}`;
      assert.ok(!grammarGoalIds.has(key), `duplicate grammar goal ${key}`);
      grammarGoalIds.add(key); grammarGoalCount++; skillIds.add(row.skillId);
      assert.ok(row.skillId && row.prompt && row.target && row.explanation, `${key} needs skill, prompt, target and explanation`);
      assert.ok(!/[\/|]/.test(row.target), `${key} cannot require a mobile-unavailable slash or pipe`);
      if (phase.variant === "choice") assert.ok(row.options?.length >= 2, `${key} needs explicit, targeted choices`);
      if (phase.variant === "typing") assert.ok(row.focus, `${key} must focus typing on the grammar-bearing form`);
    }
  }
}
assert.equal(grammarGoalCount, 810, "Grammar 4.2.1 contains 810 varied evidence rows in its source bank");
assert.equal(skillIds.size, 350, "Grammar 4.2.1 measures 350 reusable grammar skills instead of memorised strings");
const clippedSkillRequirements = [];
for (const unit of curriculum.units) for (const phase of unit.phases) {
  const rowsBySkill = new Map();
  for (const row of phase.rows) rowsBySkill.set(row.skillId, (rowsBySkill.get(row.skillId) || 0) + 1);
  for (const [skillId, available] of rowsBySkill) {
    const requested = Math.max(1, +(phase.evidencePerSkill || 1));
    if (available < requested) clippedSkillRequirements.push(`${unit.id}/${phase.id}/${skillId}: ${available}/${requested}`);
  }
}
assert.deepEqual(clippedSkillRequirements, [], "every skill has enough distinct rows for its declared evidence threshold");
const determinerForms = curriculum.units.find(unit => unit.id === "pronoun-and-determiner-system").phases.find(phase => phase.id === "forms").rows;
assert.ok(determinerForms.some(row => row.key === "this-colleague-dat" && row.skillId === "determiner.dieser"), "dieser mastery has a second distinct context");
assert.ok(determinerForms.some(row => row.key === "which-bus-dat" && row.skillId === "determiner.welcher"), "welcher mastery has a second distinct context");
const verbUnits = curriculum.units.filter(unit => unit.verb);
assert.equal(verbUnits.length, 20, "Igeműhely 2.0 provides twenty isolated high-value verb workshops");
for (const id of ["verb-sein", "verb-haben", "verb-gehen", "verb-geben", "verb-nehmen", "verb-helfen", "verb-sprechen", "verb-werden", "verb-kommen", "verb-fahren", "verb-lesen", "verb-sehen", "verb-essen", "verb-schlafen", "verb-tragen", "verb-treffen", "verb-wissen", "verb-bleiben", "verb-bringen", "verb-schreiben"]) assert.ok(verbUnits.some(unit => unit.id === id), `verb workshop is missing ${id}`);
for (const verb of verbUnits) {
  assert.equal(verb.paradigms[0].rows.length, 6, `${verb.id} shows all six present-person slots`);
  assert.equal(verb.phases[0].rows.length, 6, `${verb.id} drills the full present paradigm in order`);
  assert.equal(verb.phases[1].rows.length, 6, `${verb.id} varies all persons in sentences`);
}
const sprechenQuestion = verbUnits.find(unit => unit.id === "verb-sprechen").phases[2].rows.find(row => row.target === "Sprecht ihr Deutsch?");
assert.deepEqual([sprechenQuestion.prompt, sprechenQuestion.target], ["Beszéltek németül?", "Sprecht ihr Deutsch?"], "the reported ihr translation remains exact");
const twoWay = curriculum.units.find(unit => unit.id === "two-way-prepositions");
assert.match(twoWay.rule, /mozgás önmagában nem elég/, "two-way prepositions reject the misleading movement-only shortcut");
assert.ok(new Set(twoWay.phases.flatMap(phase => phase.rows.flatMap(row => row.target.match(/[A-ZÄÖÜ][a-zäöüß]+/g) || []))).size >= 10, "the two-way lesson rotates a broad noun vocabulary");
assert.ok(twoWay.phases[0].rows.some(row => row.prompt.includes("Wo?")) && twoWay.phases[0].rows.some(row => row.prompt.includes("Wohin?")), "Wo/Wohin contrasts stay explicit");
const reportedSentenceTransfer = curriculum.units.find(unit => unit.id === "sentence-core").phases.find(phase => phase.id === "transfer");
const reportedTransferRows = reportedSentenceTransfer.rows.map((row, index) => ({
  ...row,
  skill_stage: reportedSentenceTransfer.requireTransfer ? "transfer" : (row.stage || reportedSentenceTransfer.stage || ""),
  guided_success_at: index < reportedSentenceTransfer.evidencePerSkill ? 100 + index : 0,
  explicit_unknown_at: 0
}));
const reportedEvidence = reportedTransferRows.filter(row => row.guided_success_at > row.explicit_unknown_at);
assert.ok(reportedEvidence.length >= reportedSentenceTransfer.evidencePerSkill && reportedEvidence.some(row => row.skill_stage === "transfer"), "the reported Reggel kavet iszom phase closes after its required distinct correct examples");
assert.match(indexHtml, /grammarFocusTerms/, "typing blanks can target the grammar-bearing token");
assert.match(indexHtml, /newItemOrder=spec\.sequence\?"csv":"smart"/, "guided contrast pairs preserve CSV order");
assert.match(indexHtml, /guided_success_at/, "a clean answer records reusable skill evidence");
assert.match(indexHtml, /capabilities\?\.grammarCurriculum/, "the app loads the declared grammar curriculum from the language package");
assert.match(indexHtml, /function grammarModuleById/, "the curriculum is navigated through coherent modules");
assert.match(indexHtml, /function grammarReferenceHtml/, "each module renders its compact reference sheet before practice");
assert.match(indexHtml, /grammar-module-list/, "the overview renders the eight large modules instead of the source-unit list");
assert.ok(!indexHtml.includes("data-grammar-phase"), "the old 171-phase learner navigation is no longer rendered");
assert.match(indexHtml, /grammarRecommendation/, "the curriculum explains its next recommended module");
assert.match(indexHtml, /grammarStatusMeta/, "the curriculum exposes new, building and stable module states");
assert.match(indexHtml, /grammarPracticeHu/, "Grammar & Forms practice controls have a Hungarian UI scope");
assert.match(indexHtml, /function grammarPracticeSetSpec/, "visible module practice is built from the reviewed source bank");
assert.match(indexHtml, /task_scope:wholeAnswerChoice\?'select':policy\.focusOnly\?'focus'/, "focused tasks carry an explicit one-target scope into the engine");
assert.match(indexHtml, /if\(policy\.singleTarget&&focus\.length!==1\)throw Error/, "single-target practice rejects rows that try to measure more than one form");
assert.match(indexHtml, /if \(taskScope === "focus"\) throw new Error/, "a missing grammar target fails closed instead of blanking a random word");
assert.match(indexHtml, /grammarFocusTermsCaseSensitive/, "the blank finder distinguishes sentence-initial Der from a lower-case der target");
assert.match(indexHtml, /function maybeAutoSubmitCompletedChoice/, "grammar choices submit as soon as the learner chooses an answer");
assert.match(indexHtml, /sentenceCheckBtn\.classList\.toggle\("hidden", autoChoice\)/, "grammar choice tasks hide the redundant Check button");
assert.match(indexHtml, /currentSentence\.task_scope === "select"/, "whole-answer choices use the dedicated select renderer");
assert.match(indexHtml, /Array\.isArray\(spec\.legacySetNames\)/, "module sets can migrate evidence from the 4.1 progress sets");
assert.match(indexHtml, /"task_scope"/, "task scope survives guided-set persistence and refreshes");
assert.match(indexHtml, /grammarWorkshopSelect/, "twenty verb workshops are accessed from one compact selector");
const rowByKey = (unitId, phaseId, key) => curriculum.units.find(unit => unit.id === unitId).phases.find(phase => phase.id === phaseId).rows.find(row => row.key === key);
assert.match(rowByKey("two-way-prepositions", "transfer", "sofa-place").explanation, /hol ül.*Wo\?.*Dativ/, "sitzen is explained through static place meaning rather than false verb government");
assert.match(rowByKey("two-way-prepositions", "transfer", "cupboard-goal").explanation, /Wohin\?.*Akkusativ/, "hängen is explained through destination meaning rather than transitivity");
assert.match(rowByKey("fixed-prepositions", "pronouns", "with-him").explanation, /für ihn, de mit ihm/, "person-pronoun contrast keeps the Hungarian meanings separate");
assert.match(rowByKey("genitive", "forms", "house").explanation, /des lesz.*-es végződést kap/, "genitive possession identifies both German markings correctly");
assert.match(rowByKey("preterite-narration", "forms", "musste").explanation, /módbeli igéknél.*beszédben is gyakran/, "spoken Präteritum guidance is limited instead of overgeneralised");
assert.match(rowByKey("konjunktiv-two", "transfer", "polite").explanation, /ebben a mondatban a mir áll előbb/, "object order is described as this sentence's pattern rather than a universal rule");

const variationBank = JSON.parse(text(join(deRoot, "grammar", "variation-bank-hu-v1.json")));
assert.equal(variationBank.sourceLanguage, "hu", "the controlled variation bridge uses Hungarian source meanings");
assert.equal(variationBank.entries.length, 98, "the controlled bridge contains ninety-eight reviewed lexemes");
assert.ok(variationBank.entries.filter(entry => entry.sources.includes("core-3000")).length >= 90, "the Core 3000 supplies the broad frequency base");
assert.ok(variationBank.entries.filter(entry => entry.sources.includes("course")).length >= 60, "course vocabulary is woven into grammar practice");
assert.ok(variationBank.entries.filter(entry => entry.sources.includes("book")).length >= 25, "book vocabulary is woven into grammar practice");
const bridgeIds = new Set(variationBank.entries.map(entry => entry.lexemeId));
for (const unit of curriculum.units) for (const phase of unit.phases) for (const row of phase.rows) for (const id of row.lexemeRefs || []) assert.ok(bridgeIds.has(id), `${unit.id}/${phase.id}/${row.key} references a lexeme outside the controlled Hungarian bridge: ${id}`);
for (const id of ["variation-article-cases", "variation-verb-frames", "variation-location"]) {
  const variation = curriculum.units.find(unit => unit.id === id);
  assert.ok(variation?.variation?.dimensions?.length >= 4, `${id} needs explicit controlled variation dimensions`);
  assert.deepEqual(variation.vocabularySources, ["Core 3000", "Course", "Book"], `${id} must expose all three vocabulary sources`);
}

const optionalRecallNorm = value => String(value || "").toLocaleLowerCase().replace(/\s+[\-‐‑‒–—―−]+\s+/gu, " ").replace(/[,\.!?;:]+/gu, "").replace(/\s+/g, " ").trim();
assert.equal(optionalRecallNorm("jemanden bitten, zu bleiben"), optionalRecallNorm("jemanden bitten zu bleiben"), "comma-free recall is accepted");
assert.equal(optionalRecallNorm("sie – sie – ihr"), optionalRecallNorm("sie sie ihr"), "spaced paradigm dashes are optional in recall");
assert.equal(optionalRecallNorm("er — ihn — ihm"), optionalRecallNorm("er ihn ihm"), "dash variants are optional when they separate paradigm forms");
assert.notEqual(optionalRecallNorm("kennenlernen"), optionalRecallNorm("kennen lernen"), "punctuation leniency does not collapse word boundaries");
assert.notEqual(optionalRecallNorm("E-Mail"), optionalRecallNorm("EMail"), "word-internal hyphens remain significant");

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

const italianRoot = join(root, "decks", "it");
const italianLexicon = parseCsv(text(join(italianRoot, "lexicon.csv")));
const italianLexemeIds = new Set(italianLexicon.map(row => row.lexeme_id));
assert.equal(italianLexemeIds.size, italianLexicon.length, "Italian canonical lexeme IDs are unique");
const italianWords = parseCsv(text(join(italianRoot, "words", "core-3000.csv")));
assert.equal(italianWords.length, 3000, "Italian Core 3000 keeps all rows");
for (const row of italianWords) {
  assert.ok(row.lexeme_id, `Italian word is missing lexeme_id: ${row.target}`);
  assert.ok(italianLexemeIds.has(row.lexeme_id), `Italian word references missing lexeme: ${row.lexeme_id}`);
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
assert.match(serviceWorker, /languagedeck-4-3-1-practice-transition-recovery-20260831/, "service worker cache version is current");
assert.match(serviceWorker, /variation-bank-hu-v1\.json/, "the controlled Hungarian variation bank is available offline");
assert.match(serviceWorker, /decks\/de\/grammar\/curriculum-v4\.json/, "the unified grammar curriculum is available offline");
assert.match(serviceWorker, /decks\/it\/words\/core-3000\.csv/, "Italian vocabulary is available offline");
assert.match(serviceWorker, /decks\/it\/lexicon\.csv/, "Italian shared lexicon is available offline");
assert.match(serviceWorker, /decks\/de\/stories\/tschick\/story\.json/, "Tschick course metadata is available offline");
assert.match(serviceWorker, /icon-maskable\.svg/, "the vector maskable icon is available offline");
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
console.log(`Integrity verified: ${lexicon.length} canonical lexemes, ${aliases.length} aliases, ${cache.size} isolated ch01 cache entries, ${grammarGoalCount} grammar evidence rows across ${skillIds.size} skills.`);
