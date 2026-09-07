import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

const match = indexHtml.match(/function balancedNewItemTarget\([^)]*\) \{[\s\S]*?\n    \}/);
assert.ok(match, "balanced intake helper is present");
const balancedNewItemTarget = Function(`return (${match[0]})`)();

// The requested percentage is a ceiling: it cannot exceed the free active
// budget, and vacant queue capacity does not authorize extra unseen words.
assert.equal(balancedNewItemTarget(5, 2, false, 20, 6, 100), 2);
assert.equal(balancedNewItemTarget(3, 12, false, 20, 6, 100), 3);
assert.equal(balancedNewItemTarget(0, 12, false, 20, 6, 100), 0);

// A wholly fresh scope gets one finite bootstrap so Match and Adaptive can
// start; the same exception is not repeated after the first answers.
assert.equal(balancedNewItemTarget(2, 12, true, 0, 6, 100), 6);
assert.equal(balancedNewItemTarget(2, 12, true, 1, 6, 100), 2);

// Exhausted active capacity blocks intake even on a fresh gate, and small
// decks cannot manufacture more new cards than actually exist.
assert.equal(balancedNewItemTarget(5, 0, true, 0, 6, 100), 0);
assert.equal(balancedNewItemTarget(5, 12, true, 0, 6, 4), 4);

// Gate and whole-table fetching must use the exact same throttle path.
assert.equal(
  (indexHtml.match(/selectStudyItems\(filtered, batchSize, newRatio, practiceScope, true, pool\)/g) || []).length,
  2,
  "gate and whole-table calls both enforce balanced intake"
);
assert.match(indexHtml, /const INTAKE_RELEASE_STREAK = 2/, "one recognition cannot release an active slot");
assert.ok(!indexHtml.includes('id="practiceProgressDue"'), "the shrinking orange overlay is absent");

console.log("Balanced learning behavior checks passed.");
