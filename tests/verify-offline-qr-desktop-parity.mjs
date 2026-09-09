import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const qr=fs.readFileSync(new URL('../vendor/qrcode.js',import.meta.url),'utf8');

assert.match(html,/4\.5\.7-word-recall-format-tolerance-20260909/,'4.5.7 build marker is present');
assert.match(html,/Camera transfer · offline/,'camera transfer is exposed in Progress transfer');
assert.match(html,/const QR_TRANSFER_PREFIX="LDQ1", QR_TRANSFER_CHUNK=900/,'QR transfer uses framed payloads');
assert.match(html,/CompressionStream/,'QR transfer compresses the existing Progress Pack');
assert.match(html,/SHA-256/,'QR transfer verifies a transfer fingerprint');
assert.match(html,/BarcodeDetector/,'QR receive path uses local camera QR detection');
assert.match(html,/facingMode:coarse\?\{ideal:"environment"\}/,'phones prefer the rear camera');
assert.doesNotMatch(html,/RTCPeerConnection|WebSocket|wss:\/\//,'camera Progress transfer does not require a persistent peer/server channel');
assert.match(html,/frames can arrive in any order/i,'receiver accepts QR frames out of order');
assert.match(html,/applyProgressPack\(qrTransferReceivedPack\)/,'received QR data uses the normal conflict-aware Progress Pack merge');

const gatePos=html.indexOf('class="gate-strip integrated-gate-strip" id="gatePanel"');
const legacyPos=html.indexOf('<div id="legacyPracticeRoot"');
assert.ok(gatePos>0 && legacyPos>gatePos,'shared gate navigator lives in integrated Study shell, outside the legacy practice body');
assert.match(html,/@media \(min-width:761px\)\{\s*\.integrated-study-header\{grid-template-columns:40px minmax\(320px,600px\) 40px 40px;justify-content:center/,'desktop centres the same Command Pill control geometry');
assert.doesNotMatch(html,/@media \(min-aspect-ratio:\s*13\/10\)\{/,'desktop never enters an unqualified landscape-phone branch');
assert.match(html,/@media \(pointer:coarse\) and \(hover:none\) and \(min-aspect-ratio:\s*13\/10\)/,'landscape-specific practice layout is limited to touch devices');
assert.match(sw,/\.\/vendor\/qrcode\.js/,'QR encoder is cached for offline use');
assert.match(qr,/Kazuhiko Arase/,'vendored QR encoder retains attribution');
console.log('Offline QR transfer and desktop/mobile Study parity checks passed.');
