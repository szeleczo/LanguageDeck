import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");
assert.match(html, /4\.5\.18-gate-review-diversity-20260909/, "4.5.18 build marker is present");
assert.match(html, /function compactWordRecallNorm\(/, "vocabulary recall has a compact formatting-neutral normalizer");
assert.match(html, /function isWordRecallAnswerCorrect\(/, "normal word typing uses a dedicated lexical comparator");
assert.match(html, /function isProgressiveWordAnswerCorrect\(/, "Adaptive full recall uses the same lexical comparator");
assert.match(html, /return isWordRecallAnswerCorrect\(targetDisplay\(pair\), ans,/, "plain Words typing delegates to lexical comparison");

const start = html.indexOf("    function answerNorm(v)");
const end = html.indexOf("    const PROGRESSIVE_LEVELS", start);
assert.ok(start >= 0 && end > start, "answer comparison helpers can be extracted");
const snippet = html.slice(start, end);
const helpers = new Function("normTxt", `${snippet}; return {isFullTextAnswerCorrect,isWordRecallAnswerCorrect};`)(
  v => String(v || "").trim().toLowerCase().replace(/\s+/g, " ")
);

assert.equal(helpers.isWordRecallAnswerCorrect("der Stolz", "der stolz"), true, "noun capitalization never causes a word-recall error");
assert.equal(helpers.isWordRecallAnswerCorrect("der Stolz", "DER STOLZ"), true, "all capitalization variants are accepted");
assert.equal(helpers.isWordRecallAnswerCorrect("der Stolz", "derstolz"), true, "a missing keyboard space is accepted for vocabulary recall");
assert.equal(helpers.isWordRecallAnswerCorrect("sich erinnern (an)", "sich erinnern an"), true, "presentation punctuation is optional in vocabulary recall");
assert.equal(helpers.isWordRecallAnswerCorrect("der Stolz", "Stolz"), false, "a required article remains significant");
assert.equal(helpers.isWordRecallAnswerCorrect("die Tür", "die Tur"), false, "diacritics remain lexical evidence and are not discarded");
assert.equal(helpers.isFullTextAnswerCorrect("ich gehe", "ichgehe"), false, "sentence/full-text comparison remains spacing-sensitive");
assert.match(html, /function isProgressiveWordAnswerCorrect\([\s\S]*?return isWordRecallAnswerCorrect\(fullExpected, typedValue, alternatives\)/, "Adaptive L5/full recall delegates to the same word formatting tolerance");

console.log("Word recall capitalization/spacing/punctuation tolerance checks passed.");
