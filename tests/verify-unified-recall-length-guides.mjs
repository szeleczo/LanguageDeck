import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

assert.match(html, /4\.5\.20-live-sync-only-cleanup-20260910/, "4.5.18 build marker is present");

// Recognition/context and active recall are separate evidence dimensions.
assert.match(html, /const KNOWLEDGE_SCHEMA_VERSION=4/, "shared lexeme knowledge uses the split-evidence schema");
assert.match(html, /function activeRecallStrength\(/, "active recall has its own strength accessor");
assert.match(html, /function recognitionStrength\(/, "reading recognition has its own strength accessor");
assert.match(html, /if\(channel==="words"&&\+strength>0\)active=/, "Words evidence updates active recall");
assert.match(html, /if\(channel==="reading"&&\+strength>0\)recognition=/, "reading evidence updates recognition instead");
assert.match(html, /channel:"grammar_context"[\s\S]*strength:0,sourceMode:"grammar"/, "Grammar/Sentence context cannot raise active recall or lexical readiness by itself");

const syncBlock = html.match(/async function syncWordRowsWithGlobal\([^)]*\) \{[\s\S]*?\n    \}/)?.[0] || "";
assert.ok(syncBlock, "global-to-Words sync helper is present");
assert.match(syncBlock, /const active = activeRecallStrength\(rec\)/, "positive Adaptive seeding reads active recall only");
assert.doesNotMatch(syncBlock, /const lvl = \+rec\.lvl/, "generic reading/shared level no longer seeds Adaptive");
assert.match(syncBlock, /explicitAt > fullRecallAt[\s\S]*afterLevel = Math\.max\(0, beforeLevel - 1\)/, "a genuine Story unknown still demotes Adaptive by exactly one level");

// Book's internal word-recall stage delegates to the same Adaptive Words engine.
assert.match(html, /function startWordPractice\(\)[\s\S]*callbacks\.onAdaptiveWords/, "Book word recall hands its batch to the shared Adaptive engine");
assert.match(html, /target:'book_adaptive'[\s\S]*variant:'progressive'/, "Book uses Progressive/Adaptive recall rather than the legacy 0–4 word drill");
assert.match(html, /returnView==='book-adaptive'[\s\S]*preserveStory/, "Book reading stays alive while Adaptive recall is shown");
assert.match(html, /resumeAfterAdaptiveWords\(completed=false\)/, "Story resumes after the shared Adaptive batch");
assert.match(html, /spec\.target === "book_adaptive"[\s\S]*guided_success_at/, "each Book word needs a real correct Adaptive answer to complete the batch");

// All typing surfaces reuse the Adaptive slot renderer. Full typing is an
// all-masked challenge with zero helper letters; typed characters fill slots
// without making the remaining slots disappear.
assert.match(html, /function buildFullTypingSlotChallenge\(value\)/, "full typing has one shared all-masked slot challenge");
assert.match(html, /function fullTypingSlotsHtml\(expected, typed = "", markErrors = false\)/, "full typing renders through a shared slot helper");
assert.match(html, /return clueHtml\(challenge\.masked, fullTypingSlotTypedChars\(typed\), challenge\.missing, markErrors\)/, "full typing delegates to the Adaptive clue renderer");
assert.match(html, /else renderFullTypingSlots\(typingClue, targetDisplay\(currentTypingWord\), ""\)/, "word full typing uses live Adaptive-style slots");
assert.match(html, /else renderFullTypingSlots\(clue, currentSentence\.target, e\.target\.value, false\)/, "full progressive sentence typing keeps live slots");
assert.match(html, /guide\.innerHTML = fullTypingSlotsHtml\(expectedBlank, value\)/, "sentence blank typing keeps live per-word slots");
assert.match(html, /id="txTypingSlots">\$\{fullTypingSlotsHtml\(item\.target, ""\)\}/, "Text\/Book typing uses the same live slots");
assert.match(html, /input\.dispatchEvent\(new Event\("input",\{bubbles:true\}\)\)/, "Text\/Book in-app keyboard refreshes the live slots while typing");
assert.doesNotMatch(html, /renderFullAnswerPreview/, "the separate disappearing full-answer preview is retired");

console.log("Unified recall evidence, Book Adaptive routing and typing length-guide checks passed.");
