import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const qr=fs.readFileSync(new URL('../vendor/qrcode.js',import.meta.url),'utf8');

assert.match(html,/4\.5\.12-qr-modal-responsive-20260909/,'4.5.12 build marker is present');
assert.match(html,/Nearby transfer · no server/,'Progress transfer clearly exposes direct serverless nearby transfer');
assert.match(html,/const QR_REQUEST_PREFIX="LDR1", QR_DELTA_PREFIX="LDD1"/,'QR uses request + delta wire formats');
assert.match(html,/PROGRESS_DEVICE_KEY="ld-progress-device-v1"/,'each installation has a local transfer identity');
assert.match(html,/PROGRESS_PEERS_KEY="ld-progress-peer-cursors-v1"/,'per-peer receive watermarks are persisted');
assert.match(html,/createProgressDeltaWire\(\+sinceSec\*1000,request\.r\)/,'sender builds a delta from the receiver watermark');
assert.match(html,/applyProgressPack\(pack,\{notify:false\}\)/,'received delta reuses conflict-aware Progress Pack merge without live runtime refresh');
assert.match(html,/RTCPeerConnection/,'nearby transfer uses a temporary browser peer connection');
assert.doesNotMatch(html,/WebSocket|wss:\/\//,'transfer has no websocket/backend channel');

const cameraStart=html.indexOf('async function startQrCamera(');
const cameraEnd=html.indexOf('function drawQr(',cameraStart);
assert.ok(cameraStart>0&&cameraEnd>cameraStart,'camera start block exists');
const camera=html.slice(cameraStart,cameraEnd);
assert.ok(camera.indexOf('navigator.mediaDevices.getUserMedia') < camera.indexOf('createCameraDecoder(video)'), 'webcam starts before QR decoder capability resolution');
assert.match(html,/if\(globalThis\.BarcodeDetector\)[\s\S]*const jsqr=await loadJsQrSource\(\)/,'native BarcodeDetector has a jsQR fallback');
assert.match(html,/QR_JSQR_LOCAL="vendor\/jsqr\.js"/,'installed PWA prefers a local QR decoder');
assert.match(html,/QR_JSQR_GIT_BLOB="99ea9df26907009e5553233ffe03c529c1521739"/,'fallback decoder is integrity-pinned');
assert.match(html,/facingMode:coarse\?\{ideal:"environment"\}/,'phones prefer the rear camera');

const gatePos=html.indexOf('class="gate-strip integrated-gate-strip" id="gatePanel"');
const legacyPos=html.indexOf('<div id="legacyPracticeRoot"');
assert.ok(gatePos>0 && legacyPos>gatePos,'shared gate navigator lives in Study shell, outside legacy practice body');
assert.match(html,/@media \(min-width:761px\)\{\s*\.integrated-study-header\{grid-template-columns:40px minmax\(320px,600px\) 40px 40px;justify-content:center/,'desktop centres the same Command Pill geometry');
assert.doesNotMatch(html,/@media \(min-aspect-ratio:\s*13\/10\)\{/,'desktop never enters an unqualified landscape-phone branch');
assert.match(html,/@media \(pointer:coarse\) and \(hover:none\) and \(min-aspect-ratio:\s*13\/10\)/,'landscape-specific practice layout is touch-only');
assert.match(sw,/\.\/vendor\/qrcode\.js/,'QR encoder is cached for offline use');
assert.match(qr,/Kazuhiko Arase/,'vendored QR encoder retains attribution');
console.log('Nearby QR handshake camera path and desktop/mobile Study parity checks passed.');
