import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

assert.match(indexHtml, /id="practiceProgressToggle"[\s\S]*practice-progress-stable[\s\S]*practice-progress-recall[\s\S]*practice-progress-learned[\s\S]*practice-progress-learning[\s\S]*practice-progress-met[\s\S]*practice-progress-depth/, "the shared practice shell contains every knowledge-depth layer");
assert.doesNotMatch(indexHtml, /@media \(min-aspect-ratio:13\/10\)[\s\S]{0,500}practice-progress-mini\s*\{\s*display:none/, "desktop no longer has a wide-screen branch that hides the layered progress bar");
assert.match(indexHtml, /@media \(pointer:coarse\) and \(hover:none\) and \(min-aspect-ratio:13\/10\)[\s\S]{0,700}practice-progress-mini\{display:flex/, "touch landscape explicitly keeps the compact progress bar visible");
assert.match(indexHtml, /@media \(min-width:761px\)[\s\S]{0,700}integrated-practice-progress\{padding-left:max\(12px,calc\(\(100% - 720px\)\/2\)\)/, "desktop centres the same shared progress chrome rather than switching components");
assert.match(indexHtml, /practiceProgressToggle'\)\.onclick[\s\S]*PRACTICE_PROGRESS_VIEW==='deck'\?'session':'deck'/, "the same deck/session progress interaction remains available on every screen size");

console.log("Cross-device progress visibility checks passed.");
