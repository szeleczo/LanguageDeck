import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const must=(re,msg)=>{if(!re.test(html))throw new Error(msg)};
must(/4\.5\.19-live-sync-while-connected-20260909/,'4.5.13 build marker missing');
must(/#legacyPracticeRoot \.modal-card\.qr-transfer-card\{[^}]*width:min\(620px,calc\(100vw - 32px\)\);[^}]*max-width:620px;[^}]*overflow-y:auto;[^}]*overflow-x:hidden/s,'desktop QR modal must override generic width cap and hide horizontal overflow');
must(/\.qr-transfer-visual\{[^}]*box-sizing:border-box;[^}]*width:min\(520px,100%\);[^}]*max-width:100%/s,'QR visual must fit card content box');
must(/@media\(max-width:560px\)\{#legacyPracticeRoot \.modal-card\.qr-transfer-card\{[^}]*width:calc\(100vw - 20px\);[^}]*max-width:calc\(100vw - 20px\)/s,'mobile QR modal must stay inside viewport');
console.log('PASS verify-qr-modal-responsive');
