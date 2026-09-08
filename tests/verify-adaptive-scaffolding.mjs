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
assert.match(indexHtml, /const wordAdaptive = currentGame === "words" && wordMode === "progressive";[\s\S]*wordAdaptive \? PROGRESSIVE_LEVELS : SENTENCE_PROGRESSIVE_LEVELS/, "stronger levels are scoped to Adaptive Words");

const selectorSource = indexHtml.match(/function distributedIndexSelection\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(selectorSource, "distributed gap selector is present");
const distributedIndexSelection = Function(`return (${selectorSource})`)();
const selected = distributedIndexSelection([0,1,2,3,4,5,6,7,8], 3, () => 0.5).sort((a,b)=>a-b);
assert.equal(selected.length, 3, "selector returns the requested number of gaps");
assert.equal(new Set(selected).size, 3, "selector does not repeat a position");
assert.ok(selected.slice(1).every((value,index)=>value-selected[index] >= 2), "gaps stay non-adjacent when the word has room");

assert.match(indexHtml, /row\.progressive_level = \(correct && \(!clean \|\| wasAssisted\)\)[\s\S]*row\.progressive_assist_next = table === "word_pairs" && !correct/, "assisted success holds the level and only word failure queues rescue");
assert.match(indexHtml, /"progressive_level", "progressive_assist_next"/, "rescue state reaches live queued cards");
assert.match(indexHtml, /Guided retries pending after a wrong answer or Reveal/, "diagnostics expose pending guided retries");
assert.match(indexHtml, /reason: adaptiveWasReveal \? "reveal"[\s\S]*"assisted-correct-held"/, "diagnostics distinguish Reveal and assisted success");

console.log("Adaptive scaffolding behavior checks passed.");
