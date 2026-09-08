import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

assert.match(indexHtml, /id="practiceProgressToggle"[\s\S]*practice-progress-stable[\s\S]*practice-progress-recall[\s\S]*practice-progress-learned[\s\S]*practice-progress-learning[\s\S]*practice-progress-met[\s\S]*practice-progress-depth/, "the shared practice shell contains every knowledge-depth layer");
assert.doesNotMatch(indexHtml, /@media \(min-aspect-ratio:13\/10\)[\s\S]{0,500}practice-progress-mini\s*\{\s*display:none/, "landscape and desktop no longer hide the layered progress bar");
assert.match(indexHtml, /@media \(min-aspect-ratio:13\/10\)[\s\S]{0,500}practice-progress-mini\{display:flex/, "landscape and desktop explicitly keep the compact bar visible");
assert.match(indexHtml, /\.integrated-practice-progress\{flex-basis:36px;min-height:36px/, "wide screens reserve compact space for labels and the bar");
assert.match(indexHtml, /practiceProgressToggle'\)\.onclick[\s\S]*PRACTICE_PROGRESS_VIEW==='deck'\?'session':'deck'/, "the same deck/session progress interaction remains available on every screen size");

console.log("Cross-device progress visibility checks passed.");
