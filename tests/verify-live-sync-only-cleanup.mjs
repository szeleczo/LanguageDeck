import fs from "node:fs";
import assert from "node:assert/strict";
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
assert.match(html,/4\.5\.23-adaptive-slot-contrast-20260912/);
assert.match(html,/id="liveSyncModal"/);
assert.match(html,/data-practice-tool="sync"><b>Live sync<\/b><span>Pair two open devices with QR and sync progress while connected<\/span>/,"My library routes users to Live sync");
assert.match(html,/function startPracticeUtility\(tool\)\{if\(tool==='sync'\)\{openLiveSyncModalGlobal\(\);return\}/,"catalog Live sync shortcut opens the shared global modal directly");
for(const old of [
  /One-time nearby transfer/i,/QR-only fallback/i,/Legacy code transfer/i,/\.ldprogress/i,
  /progressPackExportBtn/,/progressPackImportBtn/,/progressPackApplyBtn/,/startNearbyReceive/,/startNearbySend/,/scanNearbyAnswer/,
  /QR_REQUEST_PREFIX/,/QR_DELTA_PREFIX/,/SYNC_PREFIX_/
]) assert.doesNotMatch(html,old,`retired transfer path remains: ${old}`);
assert.doesNotMatch(html,/<input[^>]+type="file"[^>]+progress/i,"no progress-file import UI remains");
assert.match(html,/async function applyProgressSyncState\(/,"conflict-aware merge remains as an internal Live sync primitive");
assert.match(html,/const PROGRESS_PENDING_KEY = "ld-progress-pending-v1"/,"unmatched state is still retained safely");
assert.match(html,/function repairNumericPracticeDatesV4511\(/,"legacy bad-date repair remains as migration safety, not a sharing mode");
console.log("Live-sync-only cleanup checks passed.");
