import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const start = html.indexOf("async function fetchGateContinuationItems(limit = 12, reservedIds = new Set())");
const end = html.indexOf("async function ensureWordQueue(min)", start);
assert.ok(start >= 0 && end > start, "continuation selector function can be extracted");
const source = html.slice(start, end);

const rows = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, english: `word-${i + 1}`, progressive_level: 4 }));
const context = {
  DB: { async getAll() { return rows.map(r => ({ ...r })); } },
  syncWordRowsWithGlobal: async () => {},
  fetchGateRows: xs => xs,
  ldQuizSafeEnglish: () => true,
  currentGateIndex: 0,
  gateSize: 100,
  sessionArticleBlockedIds: new Set(),
  gateContinuationSeenIds: new Set(),
  wordInterleaveBlocked: () => false,
  orderStudyBatch: xs => xs.slice(),
  sessionLoadedIds: new Set(),
  currentDeck: "de",
  currentSetName: "Core 3000",
  console
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.fetchGateContinuationItems = fetchGateContinuationItems;`, context);

const seen = [];
for (let i = 0; i < 5; i++) {
  const batch = await context.fetchGateContinuationItems(3, new Set());
  seen.push(...batch.map(x => x.id));
}
assert.deepEqual(seen.slice(0, 10), [1,2,3,4,5,6,7,8,9,10], "every gate row is selected before normal filler repeats");
assert.equal(new Set(seen.slice(0, 10)).size, 10, "first full cycle contains no duplicates");
assert.equal(context.sessionLoadedIds.size, 10, "diagnostic unique-loaded set sees the full cycle");
assert.deepEqual(seen.slice(10), [1,2,3], "a new cycle starts only after all gate rows were seen");

console.log("Completed-gate runtime rotation simulation passed.");
