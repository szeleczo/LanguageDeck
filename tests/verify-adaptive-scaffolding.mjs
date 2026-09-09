import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

assert.match(indexHtml, /4\.5\.3-unified-recall-length-guides-20260908/, "4.5.3 build marker is present");

const levelsBlock = indexHtml.match(/const PROGRESSIVE_LEVELS = \[([\s\S]*?)\n    \];/)?.[1] || "";
assert.ok(levelsBlock, "Adaptive level configuration is present");
for (const ratio of ["0.30", "0.45", "0.60", "0.75"]) {
  assert.match(levelsBlock, new RegExp(`ratio: ${ratio.replace(".", "\\.")}`), `normal Adaptive levels include ${ratio}`);
}
assert.doesNotMatch(levelsBlock, /kind: "one"/, "one-letter masking is not a normal learning level");
assert.match(indexHtml, /const PROGRESSIVE_FIRST_CONTACT_LEVEL[\s\S]*label: "First contact"[\s\S]*kind: "one"[\s\S]*assisted: true/, "one-letter masking is first-contact only");
assert.match(indexHtml, /First contact · Type the missing letter\./, "first-contact UI no longer calls the card a guided retry");

const firstContactSource = indexHtml.match(/function progressiveFirstContact\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
const levelIndexSource = indexHtml.match(/function progressiveLevelIndex\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
const clampIntSource = indexHtml.match(/function clampInt\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(firstContactSource && levelIndexSource && clampIntSource, "first-contact helpers are present");
const firstContactHarness = Function(`
  const PROGRESSIVE_LEVELS = [{},{},{},{},{}];
  ${clampIntSource}
  ${levelIndexSource}
  ${firstContactSource}
  return { progressiveFirstContact };
`)();
assert.equal(firstContactHarness.progressiveFirstContact({ progressive_level: 0 }), true, "a never-typed L1 word gets first contact");
assert.equal(firstContactHarness.progressiveFirstContact({ progressive_level: 0, diagnostic_progressive_attempts: 1 }), false, "one Adaptive typing attempt ends first contact");
assert.equal(firstContactHarness.progressiveFirstContact({ progressive_level: 0, diagnostic_typing_attempts: 1 }), false, "one full typing attempt ends first contact");
assert.equal(firstContactHarness.progressiveFirstContact({ progressive_level: 3 }), false, "a demoted well-known word never gets first contact");
assert.equal(firstContactHarness.progressiveFirstContact({ progressive_level: 3, progressive_assist_next: true, progressive_assist_reason: "repeated-wrong" }), false, "legacy assist flags cannot resurrect first contact");

const nextLevelSource = indexHtml.match(/function nextProgressiveLevel\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(nextLevelSource, "Adaptive level transition helper is present");
const nextProgressiveLevel = Function(`
  const PROGRESSIVE_LEVELS = [{},{},{},{},{}];
  ${clampIntSource}
  return (${nextLevelSource});
`)();
assert.equal(nextProgressiveLevel(4, false), 3, "one miss moves L5 to L4");
assert.equal(nextProgressiveLevel(3, false), 2, "one miss always falls one level, not to first contact");
assert.equal(nextProgressiveLevel(0, false), 0, "L1 cannot fall below L1");
assert.equal(nextProgressiveLevel(0, true), 1, "a clean first-contact success advances L1 to L2");

const selectorSource = indexHtml.match(/function distributedIndexSelection\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(selectorSource, "distributed gap selector is present");
const distributedIndexSelection = Function(`return (${selectorSource})`)();
const selected = distributedIndexSelection([0,1,2,3,4,5,6,7,8], 3, () => 0.5).sort((a,b)=>a-b);
assert.equal(selected.length, 3, "selector returns the requested number of gaps");
assert.equal(new Set(selected).size, 3, "selector does not repeat a position");
assert.ok(selected.slice(1).every((value,index)=>value-selected[index] >= 2), "gaps stay non-adjacent when the word has room");

assert.doesNotMatch(indexHtml, /progressiveRecoveryDecision|progressiveRecoverySessionMatches|adaptiveRecoverySessionId|adaptiveRecoverySessionSerial|PROGRESSIVE_RESCUE_LEVEL|PROGRESSIVE_RESCUE_REASONS/, "obsolete session-scoped rescue machinery is retired");
assert.match(indexHtml, /async function clearStaleProgressiveRecoveryState\([^)]*\)[\s\S]*progressive_assist_next = false;[\s\S]*progressive_wrong_run = 0;[\s\S]*await DB\.update\("word_pairs", item\);/, "legacy persisted recovery fields are still cleaned lazily");
assert.match(indexHtml, /row\.progressive_wrong_run = 0;[\s\S]*row\.progressive_assist_next = false;[\s\S]*row\.progressive_recovery_session = "";/, "new Adaptive answers no longer create recovery-session state");

assert.match(indexHtml, /const row = await recordAnswer\(table, itemId, correct, profile, evidence, table === "word_pairs"\);/, "Progressive Words defers shared sync until the final Adaptive level is saved");
assert.match(indexHtml, /async function recordAnswer\([^)]*deferWordGlobalSync = false\)[\s\S]*if \(!deferWordGlobalSync\) await syncWordAnswerToGlobal\(row, lexicalCorrect\);/, "ordinary Words modes keep their existing shared sync path");
assert.match(indexHtml, /row\.progressive_level = \(correct && !clean\)[\s\S]*nextProgressiveLevel\(beforeLevel, correct\)/, "clean first-contact success advances from L1 to L2 while corrected/mistap answers hold the level");
assert.match(indexHtml, /if \(table === "word_pairs"\) await syncWordAnswerToGlobal\(row, correct, true\);/, "Progressive Words syncs once after its final level is persisted");
assert.match(indexHtml, /first-contact-correct-advanced/, "diagnostics name first-contact advancement explicitly");

const syncSource = indexHtml.match(/async function syncWordAnswerToGlobal\([^)]*\) \{[\s\S]*?\n    \}/)?.[0] || "";
assert.ok(syncSource, "shared Words-to-Story sync helper is present");
assert.match(syncSource, /adaptiveStrength = Math\.max\(1, Math\.min\(5, progressiveLevelIndex\(row\) \+ 1\)\)/, "Adaptive shared strength derives from the final Adaptive level");
assert.match(syncSource, /const inferred = adaptive \? adaptiveStrength : srsStrength;/, "Adaptive and non-Adaptive Words can use appropriate evidence strength");
assert.match(syncSource, /sourceMode:adaptive\?"words-adaptive":"words"/, "shared knowledge records the evidence source");
assert.match(syncSource, /GLOBAL_WORDS\.set\(id, mergeWordKnowledgeRows/, "the in-memory Story knowledge map updates immediately after Words sync");

const adaptiveSharedStrength = levelIndex => Math.max(1, Math.min(5, levelIndex + 1));
assert.equal(adaptiveSharedStrength(0), 1, "Adaptive L1 is below Story's known threshold before first-contact success");
assert.equal(adaptiveSharedStrength(1), 2, "Adaptive L2 reaches Story's known threshold");
assert.equal(adaptiveSharedStrength(3), 4, "Adaptive L4 is strong active-recall evidence");
assert.equal(adaptiveSharedStrength(4), 5, "Adaptive L5 remains explicit active-recall strength 5");

const lapseSource = indexHtml.match(/function lapsedStreak\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(lapseSource, "gradual SRS lapse recovery is independently testable");
const lapsedStreak = Function(`return (${lapseSource})`)();
assert.deepEqual([0,1,2,3,4,5,6].map(lapsedStreak), [0,0,1,1,2,2,3], "a lapse halves prior SRS evidence without erasing established recall");

console.log("Adaptive scaffolding and shared-mastery alignment checks passed.");
