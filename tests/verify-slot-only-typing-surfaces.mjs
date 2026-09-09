import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /4\.5\.17-adaptive-gate-rotation-nearby-hardening-20260909/);

assert.match(html, /#legacyPracticeRoot \.slot-answer-input-hidden,[\s\S]*opacity: 0 !important/, "shared hidden real-input class exists");
assert.match(html, /function bindSlotInputSurface\(surface, input\)[\s\S]*input\.classList\.add\("slot-answer-input-hidden"\)/, "slot binding always hides the duplicate real input");
assert.match(html, /bindSlotInputSurface\(typingClue, typingInput\)/, "Words and Adaptive full typing use the visible clue as the only answer surface");
assert.match(html, /bindSlotInputSurface\(clue, inp\)/, "Sentence\/Grammar progressive typing hides its real input");
assert.match(html, /bindSlotInputSurface\(guide, inp\)/, "Sentence blank typing hides each real input behind its live slot guide");
assert.match(html, /class="tx-typing slot-answer-input-hidden"/, "Text\/Book typing real input is hidden");
assert.match(html, /bindSlotInputSurface\(txTypingSlots, txTypingInput\)/, "Text\/Book slot surface owns physical-keyboard focus");
assert.doesNotMatch(html, /const hideFullAnswerInput =/, "old touch-only full-answer hiding branch is removed");

console.log("PASS verify-slot-only-typing-surfaces");
