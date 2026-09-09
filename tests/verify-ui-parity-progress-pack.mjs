import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");

assert.match(html, /4\.5\.18-gate-review-diversity-20260909/, "4.5.18 build marker is present");
assert.match(html, /id="practiceCommandPill"[\s\S]*id="practiceStudyTitle"[\s\S]*id="practiceStudySub"/, "the shared Study Shell owns one command pill on every viewport");
assert.match(html, /\.practice-command-pill\{[\s\S]*border-radius:999px[\s\S]*display:grid/, "command pill has a viewport-independent component style");
assert.match(html, /\$\('practiceCommandPill'\)\.onclick=\(\)=>window\.LanguageDeckPractice\?\.openSetup\?\.\(\)/, "desktop and mobile command pill use the same practice setup path");
const quick = html.match(/function openQuickSheet\(\) \{[^}]+\}/)?.[0] || "";
assert.match(quick, /renderQuickSheet\(\)/, "command pill opens the rich language/mode/deck selector");
assert.doesNotMatch(quick, /open-session-options|integrated-practice-active/, "integrated desktop no longer diverts the command pill to a reduced settings-only path");
assert.match(html, /id="practiceSetupBtn"[\s\S]*Session options/, "session tuning remains a separate control from the command pill");

assert.match(html, /const PROGRESS_PACK_FORMAT = "LanguageDeckProgressPack"/, "Progress Pack has an explicit file format marker");
assert.match(html, /const PROGRESS_PACK_VERSION = 3/, "Progress Pack is versioned");
assert.match(html, /DB\.getAllRecords\("word_pairs"\)[\s\S]*DB\.getAllRecords\("sentence_pairs"\)[\s\S]*DB\.getAllRecords\("reading_items"\)[\s\S]*DB\.getAllRecords\("reading_patterns"\)[\s\S]*DB\.getAllRecords\("reading_units"\)/, "Progress Pack covers practice, shared knowledge and text progress stores");
assert.match(html, /PROGRESS_LOCAL_PREFIXES = \["ld-story-study-v3:", "ld-chapter-study-v1:", "ld-prep-session-v1:"\]/, "chapter reading, chapter study and preparation positions are transferred");
assert.match(html, /function mergePracticeState\(/, "practice rows merge instead of blindly replacing the database");
assert.match(html, /function mergeReadingItem\(/, "shared lexical knowledge has its own merge policy");
assert.match(html, /PROGRESS_PENDING_KEY = "ld-progress-pending-v1"/, "progress for missing decks is retained instead of discarded");
assert.match(html, /applyPendingProgressTransfers\(\)/, "held progress is retried when practice becomes available");
assert.match(html, /updatedAt:Date\.now\(\)/, "Story state writes now carry timestamps for cross-device arbitration");
assert.match(html, /id="progressPackExportBtn"[\s\S]*id="progressPackImportBtn"[\s\S]*id="progressPackApplyBtn"/, "Progress Pack is the primary transfer UI");
assert.match(html, /<summary>Legacy code transfer<\/summary>/, "old compact-code transfer remains only as backward compatibility");
assert.match(html, /progressPackFilename\(\)[\s\S]*navigator\.share/, "mobile can use the native share sheet while desktop can save the same pack");

console.log("Unified command pill and Progress Pack checks passed.");
