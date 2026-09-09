import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(here,"..","index.html"),"utf8");
assert.match(html,/4\.5\.7-word-recall-format-tolerance-20260909/,"4.5.7 Library build marker is present");
assert.match(html,/id="libraryView"[\s\S]*Lexical readiness only/,"Library has its own read-only reading-goal surface");
assert.match(html,/data-view="library"[\s\S]*>Library<\/button>/,"Library is available from the main navigation");
assert.match(html,/function libraryGreedyPlan\(/,"Library has a targeted vocabulary-unlock planner");
assert.match(html,/function libraryAnalyseProfiles\(/,"Library calculates current sentence readability from shared knowledge");
assert.match(html,/wordLevel\(x\.id\)<2/,"Library uses the same L2 shared-known threshold as Story preparation");
assert.match(html,/kind!==['"]name['"]/,"proper names do not block lexical readability");
assert.match(html,/content package cannot currently map to a lexeme/,"unmapped content is reported rather than treated as known");
const start=html.indexOf("function libraryTokens(");
const end=html.indexOf("function prepQuizGloss",start);
assert.ok(start>=0&&end>start,"Library implementation block can be isolated");
const block=html.slice(start,end);
for(const forbidden of ["dbPut(","dbDelete(","recordKnowledgeEvidence(","setWordLevel(","DB.update(","DB.putRecord(","localStorage.setItem("]){
  assert.ok(!block.includes(forbidden),`Library analysis remains read-only: no ${forbidden}`);
}
assert.match(block,/libraryGreedyPlan\(profiles,planLimit\)/,"forecast is derived without queue mutation");
assert.match(block,/unmappedSentences/,"mapping gaps are excluded from the learnable forecast");

assert.match(html,/async function loadGlobal\(\)\{GLOBAL_WORDS\.clear\(\);GLOBAL_PATTERNS\.clear\(\);LIBRARY_STORY_CACHE\.clear\(\)/,"Library forecast cache is invalidated whenever shared knowledge is reloaded");
assert.match(html,/async function setWordLevel\([^)]*\)[\s\S]*GLOBAL_WORDS\.set\(id,row\);LIBRARY_STORY_CACHE\.clear\(\)/,"course preparation invalidates Library forecasts immediately");
const greedySource=html.match(/function libraryGreedyPlan\(profiles,limit=12\)\{[\s\S]*?return\{steps,readable:current,learned\}\}/)?.[0];
assert.ok(greedySource,"greedy Library planner can be isolated");
const greedy=Function(`return (${greedySource})`)();
const demo=[
  {unmapped:[],unknown:new Set(["a"])},
  {unmapped:[],unknown:new Set(["a","b"])},
  {unmapped:[],unknown:new Set(["b"])},
  {unmapped:["orphan"],unknown:new Set(["a"])}
];
const result=greedy(demo,2);
assert.deepEqual(result.steps.map(x=>x.id),["a","b"],"planner prioritises immediate sentence unlocks deterministically");
assert.equal(result.readable,3,"two learned words unlock all fully mapped demo sentences");
assert.equal(result.steps[0].gain,1,"first selected word reports its immediate readable-sentence gain");
console.log("Read-only Library and vocabulary-unlock checks passed.");
