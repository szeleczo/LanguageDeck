import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

assert.match(html, /4\.5\.22-adaptive-vowel-consonant-slots-20260912/, "4.5.22 build marker is present");
assert.match(html, /#legacyPracticeRoot \.clue-gap\{ opacity: 0\.32; \}/, "the existing gap visual remains unchanged for the normal/vowel slot");
assert.match(html, /\.clue-gap-consonant[\s\S]*clue-gap-stroke-left[\s\S]*clip-path: inset\(0 59% 0 0\)[\s\S]*clue-gap-stroke-right[\s\S]*clip-path: inset\(0 0 0 59%\)/, "consonants split the same underscore around a small centre gap");

const kindSource = html.match(/function adaptiveGapKind\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
const gapSource = html.match(/function adaptiveGapHtml\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
const clueSource = html.match(/function clueHtml\([^)]*\) \{[\s\S]*?\n    \}/)?.[0];
assert.ok(kindSource && gapSource && clueSource, "Adaptive gap helpers are present");

const harness = Function(`
  function escapeHtml(v){ return String(v); }
  function clueCharNorm(v){ return String(v).toLowerCase(); }
  ${kindSource}
  ${gapSource}
  ${clueSource}
  return { adaptiveGapKind, adaptiveGapHtml, clueHtml };
`)();

for (const vowel of ["a","e","i","o","u","ä","ö","ü","A","Ö"]) {
  assert.equal(harness.adaptiveGapKind(vowel), "vowel", `${vowel} is shown as a vowel gap`);
}
for (const consonant of ["b","k","r","ß","z","y","W"]) {
  assert.equal(harness.adaptiveGapKind(consonant), "consonant", `${consonant} is shown as a consonant gap`);
}

const oldGap = '<span class="clue-gap">_</span>';
assert.equal(harness.adaptiveGapHtml("a"), oldGap, "vowel markup is exactly the old continuous underscore markup");
assert.match(harness.adaptiveGapHtml("b"), /clue-gap-consonant/, "consonant markup uses the interrupted slot");
assert.equal(harness.clueHtml("_", "", "a", false, true), oldGap, "masked Adaptive vowel stays continuous");
assert.match(harness.clueHtml("_", "", "b", false, true), /clue-gap-consonant/, "masked Adaptive consonant is interrupted");
assert.equal(harness.clueHtml("_", "", "b", false, false), oldGap, "full typing disables the vowel/consonant hint");
assert.equal(harness.clueHtml("_", "b", "b", false, true), '<span class="clue-fill">b</span>', "typed letters replace the hint exactly as before");

assert.match(html, /fullTypingSlotsHtml\(expected, typed = "", markErrors = false\)[\s\S]*return clueHtml\(challenge\.masked, fullTypingSlotTypedChars\(typed\), challenge\.missing, markErrors\)/, "full typing calls clueHtml without enabling shape hints");
assert.match(html, /clueHtml\(currentTypingChallenge\.masked, "", currentTypingChallenge\.missing \|\| "", false, true\)/, "Adaptive Words enables the gap hint");
assert.match(html, /clueHtml\(challenge\.masked, e\.target\.value, challenge\.missing \|\| "", false, true\)/, "Progressive sentence masking enables the same gap hint");

console.log("Adaptive vowel/consonant slot hint checks passed.");
