import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /4\.5\.19-live-sync-while-connected-20260909/, "4.5.18 build marker is present");

const loadWordsStart = html.indexOf("async function loadWords(reset = true)");
const loadWordsEnd = html.indexOf("function renderWordEmptyState()", loadWordsStart);
const loadWords = html.slice(loadWordsStart, loadWordsEnd);
assert.ok(loadWords.includes("gateContinuationMode && adaptiveWordEngineActive()"), "completed-gate load has an explicit rotation-first branch");
assert.ok(loadWords.indexOf("fetchGateContinuationItems") < loadWords.indexOf("fetchWordItems(false)"), "completed-gate queue can be seeded from whole-gate rotation instead of due-only selection");

const ensureStart = html.indexOf("async function ensureWordQueue(min)");
const ensureEnd = html.indexOf("async function loadNextWordRound()", ensureStart);
const ensure = html.slice(ensureStart, ensureEnd);
assert.ok(ensure.indexOf("if (await gateCanContinuePractice())") < ensure.indexOf("const fresh = await fetchWordItems"), "whole-gate continuation is attempted before the normal due/intake selector");
assert.match(ensure, /releaseDeferredWordReturns\(wordQueue\);[\s\S]*if \(wordQueue\.length >= min\) return;[\s\S]*if \(await gateCanContinuePractice\(\)\)/, "eligible targeted returns are released before filler rotation");

const fetchStart = html.indexOf("async function fetchGateContinuationItems");
const fetchEnd = html.indexOf("async function ensureWordQueue(min)", fetchStart);
const fetch = html.slice(fetchStart, fetchEnd);
assert.match(fetch, /gateContinuationSeenIds\.size >= gateIds\.size\) gateContinuationSeenIds\.clear\(\)/, "rotation only resets after the full current gate cycle is complete");
assert.match(fetch, /const unseenStillExists = gatePool\.some\(r => !gateContinuationSeenIds\.has\(r\.id\)\)/, "temporarily blocked unseen rows do not cause premature cycle reset");
assert.match(fetch, /sessionLoadedIds\.add\(row\.id\)/, "continuation cards count toward diagnostic unique-loaded totals");

console.log("Completed-gate review diversity regression checks passed.");
