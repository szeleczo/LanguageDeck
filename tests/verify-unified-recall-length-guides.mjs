import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

assert.match(html, /4\.5\.3-unified-recall-length-guides-20260908/, "4.5.3 build marker is present");

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

// All typing surfaces expose expected answer length with underscores.
assert.match(html, /function answerLengthGuide\(value\)/, "one shared answer-length guide exists");
assert.ok(html.includes('/[\\p{L}\\p{M}\\p{N}]/u.test(ch) ? "_"'), "letters/numbers are represented as underscores");
assert.match(html, /typingClue\.textContent = answerLengthGuideText\(targetDisplay\(currentTypingWord\)\)/, "full word typing shows answer length");
assert.match(html, /renderFullAnswerPreview\(fullPreview,[\s\S]*answerLengthGuideText\(currentSentence\.target\)/, "full progressive sentence typing shows answer length");
assert.match(html, /inp\.placeholder = answerLengthGuideText\(currentSentenceData\.blankAnswers\[blankIdx\]/, "sentence blank typing shows the expected word length");
assert.match(html, /class="tx-task-length">\$\{escapeHtml\(answerLengthGuideText\(item\.target\)\)\}/, "Text/Book typing shows the expected item length");

console.log("Unified recall evidence, Book Adaptive routing and typing length-guide checks passed.");
