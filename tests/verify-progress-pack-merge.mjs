import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");
const start = html.indexOf('    /* ---------- Progress Pack v3 ----------');
const end = html.indexOf('    /* ---------- Manage installed decks (local delete) ---------- */', start);
assert.ok(start >= 0 && end > start, "Progress Pack implementation block can be isolated");
const block = html.slice(start, end);
const source = `(function(){
  const normTxt=v=>String(v||"").trim().toLowerCase().replace(/\\s+/g," ");
  ${block}
  return {mergePracticeState,mergeReadingItem,mergeLocalProgressValue,validateProgressPack,progressPracticeKey};
})()`;
const api = vm.runInNewContext(source, { Date, JSON, Set, Map, Math, Number, String, Object, Array, Error, Blob, URL, console });

let local = { progressive_level:4, streak:5, times_seen:10, times_correct:8, times_wrong:2, last_seen:"2026-09-08T10:00:00.000Z" };
let incoming = { progressive_level:3, streak:2, times_seen:11, times_correct:8, times_wrong:3, last_seen:"2026-09-08T11:00:00.000Z" };
let merged = api.mergePracticeState(local, incoming).row;
assert.equal(merged.progressive_level, 3, "a newer lapse is allowed to lower Adaptive level");
assert.equal(merged.streak, 2, "newer scheduling state wins");
assert.equal(merged.times_seen, 11, "cumulative counters never regress");
assert.equal(merged.times_wrong, 3, "newer cumulative wrong count is preserved");

local = { progressive_level:3, streak:2, times_seen:11, last_seen:"2026-09-08T11:00:00.000Z" };
incoming = { progressive_level:5, streak:6, times_seen:8, last_seen:"2026-09-08T09:00:00.000Z" };
merged = api.mergePracticeState(local, incoming).row;
assert.equal(merged.progressive_level, 3, "older device state cannot overwrite a newer local answer");
assert.equal(merged.streak, 2, "older scheduling state is kept out");
assert.equal(merged.times_seen, 11, "counter merge keeps the larger cumulative value");

const shared = api.mergeReadingItem(
  { key:"de|x", strength:2, lvl:2, lastSeen:100, evidence:{words:{seen:4,correct:3,wrong:1,lastAt:100}}, storyState:{lvl:2,explicitUnknownAt:80,fullRecallAt:40,readingMisses:1} },
  { key:"de|x", strength:2, lvl:2, lastSeen:120, evidence:{words:{seen:3,correct:3,wrong:2,lastAt:120}}, storyState:{lvl:1,explicitUnknownAt:120,fullRecallAt:40,readingMisses:2} }
);
assert.equal(shared.evidence.words.seen, 4, "shared evidence counters merge without double counting or regression");
assert.equal(shared.evidence.words.wrong, 2, "new wrong evidence is retained");
assert.equal(shared.storyState.explicitUnknownAt, 120, "latest explicit uncertainty survives transfer");
assert.equal(shared.storyState.readingMisses, 2, "reading miss evidence is monotonic");

const olderStory = JSON.stringify({position:12,blockClock:9});
const newerStory = JSON.stringify({position:18,blockClock:11});
assert.equal(api.mergeLocalProgressValue(olderStory,newerStory),newerStory,"legacy chapter states without timestamps use forward progress as a safe tiebreaker");
const timestampedLocal = JSON.stringify({position:30,blockClock:20,updatedAt:200});
const timestampedIncoming = JSON.stringify({position:5,blockClock:2,updatedAt:300});
assert.equal(api.mergeLocalProgressValue(timestampedLocal,timestampedIncoming),timestampedIncoming,"an explicit newer timestamp can intentionally carry a reset/reread state");

assert.throws(()=>api.validateProgressPack({format:"wrong",version:3,practice:[],shared:{},local:{}}),/not a supported/,"foreign files are rejected");
assert.doesNotThrow(()=>api.validateProgressPack({format:"LanguageDeckProgressPack",version:3,practice:[],shared:{},local:{}}),"current Progress Pack format validates");

console.log("Progress Pack merge semantics passed.");
