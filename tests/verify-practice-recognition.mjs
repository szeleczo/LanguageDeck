import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const source = html.slice(html.indexOf("function ldLexicalGloss"), html.indexOf("const APP_BUILD="));
const evidence = [], knowledge = new Map();
const context = vm.createContext({ console, LANG: "de", GLOBAL_WORDS: knowledge, LIBRARY_STORY_CACHE: new Map(),
  window: { LanguageDeckKnowledge: { async record(row) { evidence.push(row); return row; } } } });
vm.runInContext(source, context);
const { ldRecognitionEntry: entry, ldRecognitionQuestion: question } = context;
const raw = [
  { id: 1, english: "house", target: "Haus", article: "das", type: "noun", lexeme_id: "de.house", alternatives: "Heim" },
  { id: 2, english: "mouse", target: "Maus", article: "die", type: "noun" },
  { id: 3, english: "train", target: "Zug", article: "der", type: "noun" },
  { id: 4, english: "child", target: "Kind", article: "das", type: "noun" },
  { id: 5, english: "home", target: "Haus", article: "das", type: "noun" },
  { id: 6, english: "house", target: "Heim", article: "das", type: "noun" },
  { id: 7, english: "HOUSE!", target: "Gebäude", type: "noun" },
  { id: 8, english: "Context: a place to live", target: "Wohnort", type: "noun" },
  { id: 9, english: "structure", target: "der Haus", type: "noun" },
];
const pool = raw.map(r => entry(r)).filter(Boolean);
assert.equal(pool.length, 8, "Book's context-fallback filter is reused");
for (const reverse of [false, true]) {
  for (let i = 0; i < 80; i++) {
    const q = question(pool[0], pool, reverse);
    assert.equal(q.options.length, 4);
    assert.equal(q.options.filter(o => o.correct).length, 1);
    assert.equal(new Set(q.options.map(o => context.ldRecognitionKey(o.text))).size, 4);
    const wrong = q.options.filter(o => !o.correct).map(o => o.text);
    assert.ok(!wrong.includes("home") && !wrong.includes("HOUSE!"));
    if (reverse) assert.ok(!wrong.includes("das Heim") && !wrong.includes("der Haus"), "alternatives and article-only contrasts are excluded");
    else assert.ok(!wrong.includes("structure"), "same target with different article is ambiguous");
  }
}
assert.equal(question(pool[0], pool.slice(0, 3)), null, "never manufacture a two/three-option card");
assert.equal(entry({ english: "Meaning not supplied", target: "x" }), null);
assert.equal(entry({ english: "…", target: "…" }, "sentences"), null, "punctuation-only placeholders are not translations");
assert.equal(entry({ english: "I ___ here", target: "Ich bin hier" }, "sentences"), null);
assert.equal(entry({ english: "be", target: "sein", task_scope: "select" }, "sentences"), null);
assert.equal(entry({ english: "I think that ...", target: "Ich glaube, dass ..." }, "sentences").target, "Ich glaube, dass ...", "paired phrase patterns are useful translations");
assert.equal(entry({ english: "I think", target: "Ich ..." }, "sentences"), null);
assert.notEqual(context.ldRecognitionKey("schon"), context.ldRecognitionKey("schön"), "diacritics remain significant");
assert.equal(entry({ english: "girl", target: "das Mädchen", article: "das" }).target, "das Mädchen", "articles are not duplicated");

// Plausible same-kind distractors outrank unrelated fallback items.
const mixed = [...pool.slice(0,4), entry({id:99,english:"run",target:"laufen",type:"verb"})];
assert.ok(!question(mixed[0], mixed, false, () => 0.5).options.some(o => o.text === "run"));
const phrasePool = [
 ["I would like a coffee.", "Ich hätte gern einen Kaffee."],
 ["The train is late.", "Der Zug hat Verspätung."],
 ["Where is the station?", "Wo ist der Bahnhof?"],
 ["Can you help me?", "Kannst du mir helfen?"]
].map(([english,target],id)=>entry({id,english,target},"sentences"));
for (const reverse of [false,true]) assert.equal(question(phrasePool[0],phrasePool,reverse).options.length,4);

const before = structuredClone(raw[0]);
await context.ldRecordRecognitionEvidence(raw[0], "words", "de", false, true);
await context.ldRecordRecognitionEvidence(raw[0], "words", "de", true, false);
await context.ldRecordRecognitionEvidence({lexeme_refs:"de.house",...raw[0]}, "sentences", "de", true, true);
assert.deepEqual(raw[0], before, "recognition cannot mutate production/SRS fields");
assert.equal(evidence.length, 2, "sentence recognition never claims isolated-word recall");
assert.ok(evidence.every(e => e.channel === "reading" && e.strength <= 2));
assert.equal(evidence[1].strength, 0, "a wrong choice cannot demote Adaptive");
assert.ok(!evidence.some(e=>e.channel === "words" || e.storyState?.fullRecallAt || e.storyState?.explicitUnknownAt));

// Run the real shared knowledge writer against an established Adaptive record.
let stored = { key:"de|de.house", language:"de", itemKey:"de.house", activeRecallStrength:5,
  activeRecallUpdatedAt:123, recognitionStrength:2, storyState:{lvl:2,fullRecallAt:100,explicitUnknownAt:90},
  evidence:{ words:{seen:8,correct:7,wrong:1,lastAt:123}, grammar_context:{seen:3,correct:2,wrong:1,lastAt:120} } };
const protectedBefore=structuredClone(stored);
const real=vm.createContext({ LANG:"de",GLOBAL_WORDS:new Map(),LIBRARY_STORY_CACHE:new Map(),window:{},
  dbGet:async()=>structuredClone(stored),dbPut:async(_,row)=>{stored=structuredClone(row);} });
const knowledgeSource=html.slice(html.indexOf("const KNOWLEDGE_SCHEMA_VERSION=4"),html.indexOf("async function migrateSharedKnowledge"));
vm.runInContext(source+knowledgeSource+"\nwindow.LanguageDeckKnowledge={record:recordKnowledgeEvidence};",real);
for(const correct of [true,false]) await real.ldRecordRecognitionEvidence(raw[0],"words","de",false,correct);
assert.equal(stored.activeRecallStrength,protectedBefore.activeRecallStrength);
assert.equal(stored.activeRecallUpdatedAt,protectedBefore.activeRecallUpdatedAt);
assert.deepEqual(stored.evidence.words,protectedBefore.evidence.words);
assert.deepEqual(stored.evidence.grammar_context,protectedBefore.evidence.grammar_context);
assert.equal(stored.storyState.fullRecallAt,100);
assert.equal(stored.storyState.explicitUnknownAt,90);
assert.equal(stored.evidence.reading.correct,2, "existing Story recognition plus the new correct choice");
assert.equal(stored.evidence.reading.wrong,1);

// Exercise the real answer handler, including its synchronous double-answer lock.
class Element {
  constructor(){this.children=[];this.textContent="";this.hidden=false;this.classList={add(){},contains(){return false;},toggle(){}};}
  replaceChildren(){this.children=[];}
  append(...items){this.children.push(...items);this.lastElementChild=items.at(-1);}
  appendChild(x){this.append(x);}
  setAttribute(){} focus(){}
}
const els = new Map(), get = id => {if(!els.has(id))els.set(id,new Element());return els.get(id);};
const engineStart=html.indexOf("    /* ---------- Practice four-choice recognition ---------- */");
const engineEnd=html.indexOf("    /* ---------- End Practice four-choice recognition ---------- */",engineStart);
let saved=0;
Object.assign(context, { $:get, document:{createElement:()=>new Element()},
  currentGame:"words", wordMode:"recognition", sentenceMode:"order", currentDeck:"de", newItemOrder:"csv",
  correctCount:0, wrongCount:0, sessionLoadedIds:new Set(), statusEl:get("status"),
  shuffleArr:xs=>xs.slice(), updateScore(){}, dispatchPracticeState(){},
  queuePracticeWrite:async task=>task(), ldRecordRecognitionEvidence:async()=>{saved++;await Promise.resolve();}
});
vm.runInContext(html.slice(engineStart,engineEnd)+`\nthis.begin = session => { recognitionSession = session; nextRecognitionQuestion(session); };`,context);
const session = {kind:"words",language:"de",reverse:false,entries:pool,prompts:pool.slice(0,4),queue:[],retries:[],recent:[],answered:0,current:null,busy:false,locked:false};
context.begin(session);
const first=session.current.entry.row.id;
const wrong=session.current.options.findIndex(o=>!o.correct);
await Promise.all([context.answerRecognition(wrong,session),context.answerRecognition(wrong,session)]);
assert.equal(saved,1); assert.equal(context.wrongCount,1); assert.equal(session.answered,1);
assert.ok(get("recognitionOptions").children.every(b=>b.disabled));
for(let i=0;i<2;i++){
 context.nextRecognitionQuestion(session);
 assert.notEqual(session.current.entry.row.id,first,"miss waits for two other prompts");
 await context.answerRecognition(session.current.options.findIndex(o=>o.correct),session);
}
context.nextRecognitionQuestion(session);
assert.equal(session.current.entry.row.id,first,"miss returns after two separated answers");
context.resetRecognition();
await context.answerRecognition(0,session);
assert.equal(saved,3,"stale handlers cannot record evidence after a mode switch");

assert.match(html,/if \(handleRecognitionShortcut\(event\)\) return;/);
assert.match(html,/event\.repeat \|\| event\.isComposing/);
assert.match(html,/role="status" aria-live="polite"/);
assert.match(html,/recognition-option\{[^}]*min-height:64px/);
assert.match(html,/recognition-long \.recognition-options\{grid-template-columns:1fr/);

// Exercise the real service worker with a cold version-query cache and a consumed network body.
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8"),handlers=new Map(),cacheFiles=new Map();
const cache={async match(request){const value=cacheFiles.get(typeof request==="string"?request:request.url);return value?new Response(value):undefined;},
  async put(request,response){cacheFiles.set(request.url,await response.text());}};
let online=false;
const worker=vm.createContext({URL,Response,caches:{async open(){return cache;}},
 self:{location:{origin:"https://example.test"},registration:{scope:"https://example.test/app/"},addEventListener:(name,handler)=>handlers.set(name,handler)},
 fetch:async()=>{if(!online)throw Error("offline");return new Response("fresh");}});
vm.runInContext(sw,worker);
async function resource(url,mode="cors"){
 let response,completed;
 handlers.get("fetch")({request:{url,mode,method:"GET"},respondWith:p=>{response=p;},waitUntil:p=>{completed=p;}});
 const result=await response,text=await result.text();await completed;return {status:result.status,text};
}
cacheFiles.set("https://example.test/app/decks/de/manifest.json","cached manifest");
cacheFiles.set("https://example.test/app/index.html","cached shell");
assert.equal((await resource("https://example.test/app/decks/de/manifest.json?v=4.5.24")).text,"cached manifest");
assert.equal((await resource("https://example.test/app/?lang=de","navigate")).text,"cached shell");
assert.equal((await resource("https://example.test/app/decks/de/manifest.json?other=content")).status,503,"meaningful query parameters are preserved");
online=true;
assert.equal((await resource("https://example.test/app/asset?v=current")).text,"fresh");
assert.equal(cacheFiles.get("https://example.test/app/asset?v=current"),"fresh","cache write survives immediate client consumption");
console.log("Practice recognition: directions, ambiguity, small pools, phrase/sentence support, knowledge isolation, double-answer lock and separated retries passed.");
