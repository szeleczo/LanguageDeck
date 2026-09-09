import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(html,/4\.5\.17-adaptive-gate-rotation-nearby-hardening-20260909/);

const stateFields=[
  'streak','next_due','word_next_due','learning_pressure','article_pressure','article_streak','article_next_due','article_last_seen',
  'article_times_seen','article_times_correct','article_times_wrong','times_seen','times_correct','times_wrong','diagnostic_total_wrong','progressive_level','last_seen','last_correct','last_wrong','first_seen',
  'progressive_wrong_run','progressive_last_session','progressive_rescue_reason','mastered_at','review_count','difficulty','ease','interval','stage','guided_attempts','guided_last_answer_at','guided_success_at','guided_full_recall_at','explicit_unknown_at','full_recall_at'
];
const timeFields=new Set(['next_due','word_next_due','article_next_due','article_last_seen','last_seen','last_correct','last_wrong','first_seen','mastered_at','guided_last_answer_at','guided_success_at','guided_full_recall_at','explicit_unknown_at','full_recall_at']);
const progressTimestamp=v=>typeof v==='number'?v:(Date.parse(v)||0);
const qrWireTime=v=>{const ms=progressTimestamp(v);return ms?Math.round(ms/1000):0};
const qrUnwireTime=v=>+v>0?+v*1000:0;
const qrWireState=state=>{const out=[];stateFields.forEach((field,index)=>{if(!Object.prototype.hasOwnProperty.call(state,field))return;let value=state[field];if(value===undefined||value===null||value==='')return;if(timeFields.has(field))value=qrWireTime(value);out.push(index,value)});return out};
const qrUnwireState=values=>{const out={};for(let i=0;i+1<values.length;i+=2){const field=stateFields[+values[i]];let value=values[i+1];if(timeFields.has(field))value=qrUnwireTime(value);out[field]=value}return out};
function dict(){const decks=[],sets=[],dm=new Map(),sm=new Map();const ix=(m,a,v)=>{if(!m.has(v)){m.set(v,a.length);a.push(v)}return m.get(v)};return{decks,sets,deck:v=>ix(dm,decks,v),set:v=>ix(sm,sets,v)}}
function wire(item,d){const table=item.table==='sentence_pairs'?1:0,deck=d.deck(item.deck||''),identity=table?(item.skillId||''):(item.lexemeId||'');if(identity)return[table,deck,identity,qrWireState(item.state||{})];return[table,deck,'',qrWireState(item.state||{}),d.set(item.setName||''),item.english||'',item.target||'']}
function unwire(x,decks,sets){const table=+x[0]===1?'sentence_pairs':'word_pairs',identity=x[2]||'',out={table,deck:decks[+x[1]]||'',setName:'',english:'',target:'',lexemeId:'',skillId:'',state:qrUnwireState(x[3]||[])};if(identity){if(table==='sentence_pairs')out.skillId=identity;else out.lexemeId=identity;return out}out.setName=sets[+x[4]]||'';out.english=x[5]||'';out.target=x[6]||'';return out}

const d=dict();
const sample={table:'word_pairs',deck:'de',setName:'Core 3000',english:'pride',target:'der Stolz',lexemeId:'de:w123',skillId:'',state:{streak:6,progressive_level:4,times_seen:12,article_times_seen:5,full_recall_at:Date.UTC(2026,8,9,8,0,0),last_seen:'2026-09-09T08:00:00.000Z'}};
const packed=wire(sample,d);
assert.equal(packed.length,4,'stable-id practice row omits repeated set/source/target strings');
assert.ok(!JSON.stringify(packed).includes('Core 3000')&&!JSON.stringify(packed).includes('der Stolz'),'canonical-id row is compact');
const rebuilt=unwire(packed,d.decks,d.sets);
assert.equal(rebuilt.lexemeId,sample.lexemeId);
assert.equal(rebuilt.state.progressive_level,4);
assert.equal(rebuilt.state.article_times_seen,5,'article learning state survives compact wire');
assert.equal(rebuilt.state.full_recall_at,sample.state.full_recall_at,'full recall evidence survives compact wire');

assert.match(html,/qrSharedActivity\(r\)>since/,'shared knowledge is delta-filtered');
assert.match(html,/progressRowActivity\(r\)>since/,'Words\/Grammar practice is delta-filtered');
assert.match(html,/qrLocalActivity\(raw\)>since/,'Story\/chapter local state is delta-filtered');
assert.match(html,/CompressionStream/,'wire payload is gzip-compressed where supported');
assert.match(html,/SHA-256/,'frame payload has a checksum');
assert.match(html,/First QR transfer:[^`]*frames[\s\S]*\.ldprogress file is faster/,'large first transfer recommends the durable file fallback');
console.log('Compact delta QR wire semantics passed.');
