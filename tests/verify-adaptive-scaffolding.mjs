import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

const levelsBlock = indexHtml.match(/const PROGRESSIVE_LEVELS = \[([\s\S]*?)\n    \];/)?.[1] || "";
assert.ok(levelsBlock, "Adaptive level configuration is present");
for (const ratio of ["0.30", "0.45", "0.60", "0.75"]) {
  assert.match(levelsBlock, new RegExp(`ratio: ${ratio.replace(".", "\\.")}`), `normal Adaptive levels include ${ratio}`);
}
assert.doesNotMatch(levelsBlock, /kind: "one"/, "one-letter masking is not a normal learning level");
assert.match(indexHtml, /const PROGRESSIVE_RESCUE_LEVEL[\s\S]*kind: "one"[\s\S]*assisted: true/, "one-letter masking remains available as assisted rescue");
assert.match(indexHtml, /const PROGRESSIVE_RESCUE_REASONS = new Set\(\["reveal", "repeated-wrong"\]\)/, "guided retry requires an explicit current-build reason");
assert.match(indexHtml, /const wordAdaptive = currentGame === "words" && wordMode === "progressive";[\s\S]*wordAdaptive \? PROGRESSIVE_LEVELS : SENTENCE_PROGRESSIVE_LEVELS/, "stronger levels are scoped to Adaptive Words");

const sessionMatchSource = indexHtml.match(/function progressiveRecoverySessionMatches\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
const rescueReasonSource = indexHtml.match(/function progressiveRescueReason\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(sessionMatchSource && rescueReasonSource, "session-scoped rescue helpers are present");
const rescueHarness = Function(`
  let adaptiveRecoverySessionId = "runtime:2";
  const PROGRESSIVE_RESCUE_REASONS = new Set(["reveal", "repeated-wrong"]);
  ${sessionMatchSource}
  ${rescueReasonSource}
  return { progressiveRecoverySessionMatches, progressiveRescueReason };
`)();
const staleRescue = { progressive_assist_next:true, progressive_assist_reason:"repeated-wrong", progressive_recovery_session:"runtime:1" };
const currentRescue = { ...staleRescue, progressive_recovery_session:"runtime:2" };
assert.equal(rescueHarness.progressiveRescueReason(staleRescue), "", "a rescue left by an older learning session is ignored");
assert.equal(rescueHarness.progressiveRescueReason(currentRescue), "repeated-wrong", "a qualified rescue in the active learning session is honoured");

const selectorSource = indexHtml.match(/function distributedIndexSelection\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(selectorSource, "distributed gap selector is present");
const distributedIndexSelection = Function(`return (${selectorSource})`)();
const selected = distributedIndexSelection([0,1,2,3,4,5,6,7,8], 3, () => 0.5).sort((a,b)=>a-b);
assert.equal(selected.length, 3, "selector returns the requested number of gaps");
assert.equal(new Set(selected).size, 3, "selector does not repeat a position");
assert.ok(selected.slice(1).every((value,index)=>value-selected[index] >= 2), "gaps stay non-adjacent when the word has room");

const recoverySource = indexHtml.match(/function progressiveRecoveryDecision\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(recoverySource, "Adaptive recovery decision is independently testable");
const progressiveRecoveryDecision = Function(`return (${recoverySource})`)();
assert.deepEqual(progressiveRecoveryDecision(false, false, 0), { wrongRun: 1, rescueReason: "" }, "one miss only lowers the real level");
assert.deepEqual(progressiveRecoveryDecision(false, false, 1), { wrongRun: 2, rescueReason: "repeated-wrong" }, "the second consecutive miss qualifies for guided retry");
assert.deepEqual(progressiveRecoveryDecision(false, true, 0), { wrongRun: 1, rescueReason: "reveal" }, "Reveal qualifies immediately for guided retry");
assert.deepEqual(progressiveRecoveryDecision(true, false, 2), { wrongRun: 0, rescueReason: "" }, "a correct recall clears the failure run and rescue");
assert.match(indexHtml, /const previousWrongRun = progressiveRecoverySessionMatches\(before\)[\s\S]*\? clampInt\(before\?\.progressive_wrong_run \|\| 0, 0, 99\)[\s\S]*: 0;/, "an old session cannot supply the first half of a repeated-wrong pair");
assert.match(indexHtml, /row\.progressive_level = \(correct && \(!clean \|\| wasAssisted\)\)[\s\S]*progressiveRecoveryDecision\(correct, adaptiveWasReveal, previousWrongRun\)[\s\S]*row\.progressive_recovery_session = correct \? "" : adaptiveRecoverySessionId;/, "recording binds recovery state to the active learning session");
assert.match(indexHtml, /function resetSessionMistakes\(\)[\s\S]*adaptiveRecoverySessionId = `\$\{PRACTICE_RUNTIME_ID\}:\$\{\+\+adaptiveRecoverySessionSerial\}`;/, "starting or restarting practice creates a fresh Adaptive recovery session");
assert.match(indexHtml, /"progressive_level", "progressive_assist_next", "progressive_assist_reason", "progressive_wrong_run", "progressive_recovery_session"/, "session-bound recovery state reaches live queued cards");
assert.match(indexHtml, /const queuedTypingWord = wordQueue\.shift\(\);[\s\S]*await DB\.getById\("word_pairs", queuedTypingWord\.id\)[\s\S]*noteAdaptiveLevelLoad\(currentTypingWord, guidedPractice \? "guided-queue-live-db" : "deck-queue-live-db"\)/, "Adaptive cards re-read persisted learning state when dequeued");
assert.match(indexHtml, /async function clearStaleProgressiveRecoveryState\([^)]*\)[\s\S]*progressive_wrong_run = 0;[\s\S]*await DB\.update\("word_pairs", item\);/, "older-session recovery state is removed lazily without scanning the whole deck");
assert.match(indexHtml, /if \(wordMode === "progressive"\) currentTypingWord = await clearStaleProgressiveRecoveryState\(currentTypingWord\);[\s\S]*noteAdaptiveLevelLoad/, "stale recovery is cleared before an Adaptive card is rendered");
assert.match(indexHtml, /Guided retries pending in this learning session after Reveal or repeated wrong answers/, "diagnostics identify that guided retries are session-scoped");
assert.match(indexHtml, /reason: adaptiveWasReveal \? "reveal"[\s\S]*"assisted-correct-held"/, "diagnostics distinguish Reveal and assisted success");
assert.match(indexHtml, /if \(!item\?\.progressive_assist_next \|\| !progressiveRecoverySessionMatches\(item\)\) return "";/, "legacy and older-session rescue flags are ignored instead of leaking into the new session");
assert.match(indexHtml, /Guided retry · Tap the missing letter\./, "assisted one-letter cards are visibly labelled instead of contradicting the stored-level dots");

const lapseSource = indexHtml.match(/function lapsedStreak\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(lapseSource, "gradual SRS lapse recovery is independently testable");
const lapsedStreak = Function(`return (${lapseSource})`)();
assert.deepEqual([0,1,2,3,4,5,6].map(lapsedStreak), [0,0,1,1,2,2,3], "a lapse halves prior SRS evidence without erasing established recall");
assert.match(indexHtml, /row\.progressive_level = \(correct && \(!clean \|\| wasAssisted\)\)[\s\S]*nextProgressiveLevel\(beforeLevel, correct\)/, "SRS lapse recovery does not replace the independent one-level Adaptive fallback");

console.log("Adaptive scaffolding behavior checks passed.");
