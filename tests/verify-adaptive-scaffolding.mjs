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
assert.match(indexHtml, /row\.progressive_level = \(correct && \(!clean \|\| wasAssisted\)\)[\s\S]*progressiveRecoveryDecision\(correct, adaptiveWasReveal, previousWrongRun\)[\s\S]*row\.progressive_assist_next = !!recovery\.rescueReason/, "recording uses the tested recovery decision");
assert.match(indexHtml, /"progressive_level", "progressive_assist_next", "progressive_assist_reason", "progressive_wrong_run"/, "recovery state reaches live queued cards");
assert.match(indexHtml, /Guided retries pending after Reveal or repeated wrong answers/, "diagnostics expose only qualified guided retries");
assert.match(indexHtml, /reason: adaptiveWasReveal \? "reveal"[\s\S]*"assisted-correct-held"/, "diagnostics distinguish Reveal and assisted success");
assert.match(indexHtml, /if \(!item\?\.progressive_assist_next\) return "";[\s\S]*PROGRESSIVE_RESCUE_REASONS\.has\(reason\) \? reason : ""/, "legacy bare rescue flags are ignored instead of leaking into the new build");

const lapseSource = indexHtml.match(/function lapsedStreak\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(lapseSource, "gradual SRS lapse recovery is independently testable");
const lapsedStreak = Function(`return (${lapseSource})`)();
assert.deepEqual([0,1,2,3,4,5,6].map(lapsedStreak), [0,0,1,1,2,2,3], "a lapse halves prior SRS evidence without erasing established recall");
assert.match(indexHtml, /row\.progressive_level = \(correct && \(!clean \|\| wasAssisted\)\)[\s\S]*nextProgressiveLevel\(beforeLevel, correct\)/, "SRS lapse recovery does not replace the independent one-level Adaptive fallback");

console.log("Adaptive scaffolding behavior checks passed.");
