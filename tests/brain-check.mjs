// Brain page check. Opens index.html in a real browser (Playwright) and tries the main things.
// Run it:  npm install --no-save playwright   then   node tests/brain-check.mjs
// Optional: set CHROMIUM_PATH to use a browser you already have. Prints PASS/FAIL lines and ERRORS [].
import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const PAGE = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href;
const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const b = await pw.chromium.launch(launchOpts);
const errs = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 950 }, colorScheme: 'dark' });
const p = await ctx.newPage();
p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERR '+e.message));
await p.goto(PAGE);
await p.selectOption('#speed','0');
const card = (t) => p.locator('.entry').filter({ has: p.locator('.ttl', { hasText: new RegExp('^'+t+'$') }) });
let failed = 0;
const ok = (n, c, x='') => { if (!c) failed++; console.log((c?'PASS ':'FAIL ')+n, x); };
const count = async () => (await p.locator('#memCount').innerText()).toLowerCase();
const runs = async () => (await p.locator('#runBadge').innerText());
let N = 0;
const settle = async (expectRun=true) => { await p.waitForFunction(()=>!document.querySelector('#askBtn').disabled);
  if (expectRun) { N++; await p.waitForFunction((n)=>document.querySelector('#runBadge').textContent==='runs: '+n && !document.querySelector('#brain').classList.contains('learning') && document.querySelector('#runReport').textContent.length>0, N, {timeout:20000}); }
  else await p.waitForTimeout(300); };
const ask = async (q, expectRun=true) => { await p.fill('#q', q); await p.click('#askBtn'); await settle(expectRun); };
console.log('start:', await count(), await runs());
ok('seeded 6 programs + 5 skills = 11', (await count()).includes('11 entries'), await count());
// session 1
await ask('What does Brain learn from?');
console.log('after s1:', await count(), await runs(), '| report:', await p.locator('#runReport').innerText());
ok('brain ran once', (await runs())==='runs: 1');
ok('badge shown', await p.locator('#memBadge').isVisible(), await p.locator('#memBadge').innerText());
await p.click('#modeGraph'); await p.waitForTimeout(900);
ok('graph nodes', (await p.locator('#gNodes .gn').count())>15, await p.locator('#gNodes .gn').count());
// drag brain in graph mode
const br = await p.locator('#brain').boundingBox();
await p.mouse.move(br.x+48, br.y+48); await p.mouse.down(); await p.mouse.move(br.x+48+150, br.y+48+60, {steps:6}); await p.mouse.up(); await p.waitForTimeout(700);
const br2 = await p.locator('#brain').boundingBox(); ok('graph brain drag', Math.abs(br2.x-br.x-150)<3, br2.x-br.x);
await p.click('#center');
// session 2 same topic -> remember + reinforce
await p.click('#tab-chat');
await ask('What does Brain learn from?');
const log = await p.locator('#log').innerText();
ok('remembers earlier ask', /I remember this/.test(log));
console.log('report2:', await p.locator('#runReport').innerText());
// correction applied to next answer
await p.click('#tab-mem'); await p.fill('#memSearch','What Brain learns from');
await card('What Brain learns from').first().getByRole('button',{name:'Correct'}).click();
await p.locator('.entry input[type=text]').first().fill('Brain learns only from my own activity.');
await p.getByRole('button',{name:'Save correction'}).click();
await p.fill('#memSearch','');
await p.click('#tab-chat'); await ask('What does Brain learn from?');
const ans = await p.locator('.answer').last().innerText();
ok('answer uses correction', /own activity/.test(ans) && /your correction/.test(ans));
// delete -> blocked
await p.click('#tab-mem'); await p.fill('#memSearch','What a run does');
await ask('What does a Brain run do?');
await p.click('#tab-mem'); await p.fill('#memSearch','What a run does');
ok('concept created', (await card('What a run does').count())>0);
await card('What a run does').first().getByRole('button',{name:'Delete'}).click();
await card('What a run does').first().getByRole('button',{name:'Yes, delete'}).click();
ok('deleted', (await card('What a run does').count())===0);
await p.fill('#memSearch','');
await ask('What does a Brain run do?');
await p.click('#tab-mem'); await p.fill('#memSearch','What a run does');
ok('not relearned after delete', (await card('What a run does').count())===0, await p.locator('#runReport').innerText());
await p.fill('#memSearch','');
// skip 30 days -> stale
await p.click('#skip30'); N++; await p.waitForFunction((n)=>document.querySelector('#runBadge').textContent==='runs: '+n && !document.querySelector('#brain').classList.contains('learning'), N);
const c3 = await count(); ok('stale marked', /stale/.test(c3), c3);
// stale restored by asking again
await p.click('#tab-chat'); await ask('Who is in charge of the repo, and who audits the work?');
console.log('after refresh:', await count(), '|', await p.locator('#runReport').innerText());
// incognito
const before = await runs(); const nSess = await p.evaluate(()=>JSON.parse(localStorage.getItem('brain.mem.v2')).sessions.length);
await p.check('#incog'); await ask('Who decides what ships and who merges?', false); await p.uncheck('#incog');
const nSess2 = await p.evaluate(()=>JSON.parse(localStorage.getItem('brain.mem.v2')).sessions.length);
ok('incognito not saved', nSess===nSess2 && (await runs())===before, nSess+' -> '+nSess2);
// secret filter
await ask('my password is hunter2 and api_key=sk-abcdefghijklmnop what does Brain learn from?');
const l2 = await p.locator('#log').innerText();
ok('secret filtered + warned', /\[filtered\]/.test(l2) && /Warning/.test(l2) && !/hunter2/.test(l2) && !/sk-abcdef/.test(l2));
const stored = await p.evaluate(()=>localStorage.getItem('brain.mem.v2')); ok('secret not stored', !/hunter2|sk-abcdef/.test(stored));
// brain off
await p.click('#tab-set'); await p.uncheck('#setBrain');
const e0 = await count(); await ask('Who decides what ships and who merges?', false);
ok('brain off writes nothing', (await count())===e0 && /Brain is off/.test(await p.locator('#log').innerText()));
await p.click('#tab-set'); await p.check('#setBrain');
// backup
const countBeforeBackup = await count();
await p.click('#tab-mem'); await p.locator('summary', {hasText:'Backup'}).click(); await p.click('#bExport');
const bk = await p.inputValue('#backup'); ok('backup json', bk.startsWith('{') && bk.length>1000, bk.length);
await p.click('#tab-set');
await p.click('#resetMem'); await p.click('#resetMem');
await p.click('#tab-mem'); ok('reset to 11', (await count()).includes('11 entries'), await count());
await p.fill('#backup', bk); await p.click('#bLoad'); await p.click('#bLoad'); ok('restore brings back the same memory', (await count())===countBeforeBackup, (await count())+' vs '+countBeforeBackup);
// hostile import
await p.fill('#backup', '{"entries":[{"id":"e9","key":"k","type":"concept","title":"<img src=x onerror=alert(1)>","note":"n","sources":[],"links":["zz"],"strength":2,"seen":1,"created":1,"status":"fresh"},null,5]}');
await p.click('#bLoad'); await p.click('#bLoad'); ok('hostile import safe', await p.locator('.entry .ttl', {hasText:'<img'}).count()===1 && await p.locator('.entry img').count()===0);
// reload persistence
await p.reload(); ok('persist after reload', (await count()).startsWith('memory · 1 entries'), await count());
await ctx.close();

// ---- Muse's cases ----
const ctx2 = await b.newContext({ viewport: { width: 1280, height: 900 } });
const r = await ctx2.newPage(); r.on('pageerror', e=>errs.push('PAGEERR-r '+e.message));
await r.goto(PAGE); await r.selectOption('#speed','0');
// secrets
const secrets = ['access_token=abcd1234','client_secret: zzzz','db_password=hunter2','sk_live_abcdefghijklmnop','Bearer abcdefghijklmnopqrstuv','xoxb-1234567890-abcdef','AIzaSyA1234567890123456789012345678901','my password hunter2','postgres://bob:pw123@host/db','-----BEGIN RSA PRIVATE KEY-----\nMIIabc\n-----END RSA PRIVATE KEY-----'];
await r.click('#tab-mem');
const NEEDLES = {'access_token=abcd1234':'abcd1234','client_secret: zzzz':'zzzz','db_password=hunter2':'hunter2','sk_live_abcdefghijklmnop':'abcdefghijklmnop','Bearer abcdefghijklmnopqrstuv':'abcdefghijklmnopqrstuv','xoxb-1234567890-abcdef':'1234567890-abcdef','AIzaSyA1234567890123456789012345678901':'AIzaSyA1234567890123456789012345678901','my password hunter2':'hunter2','postgres://bob:pw123@host/db':'pw123','-----BEGIN RSA PRIVATE KEY-----\nMIIabc\n-----END RSA PRIVATE KEY-----':'MIIabc'};
let leaked = [];
for (const sec of secrets) {
  await r.selectOption('#aType','concept'); await r.fill('#aTitle','note'+Math.random().toString(36).slice(2,6)); await r.fill('#aNote', 'value '+sec.replace(/\n/g,' ')); await r.click('#addForm button[type=submit]');
  await r.waitForTimeout(150);
  const st = await r.evaluate(()=>localStorage.getItem('brain.mem.v2'));
  const needle = NEEDLES[sec];
  if (st.includes(needle)) leaked.push(sec);
}
ok('secret shapes filtered', leaked.length===0, JSON.stringify(leaked));
// hostile imports
await r.locator('summary', {hasText:'Backup'}).click();
const evil = {entries:[
  {id:'e1',key:'c:corpus:6',corpusId:6,type:'concept',title:'Fake title',note:'Spoofed note',sources:[],links:[],strength:2,seen:1e20,created:-5,status:'fresh',corrected:true},
  {id:'e2"] ,x',key:'k',type:'concept',title:'bad id',note:'n',sources:[],links:[],strength:1,seen:1,created:1,status:'fresh'},
  {id:'e3',key:'zz',corpusId:5,type:'concept',title:'forged corpus id',note:'n',sources:[],links:[],strength:1,seen:1,created:1,status:'fresh'}],
  sessions:[{id:'s1',ts:1e30,q:'q',msgs:[{from:'constructor',text:'x'},{from:'max',text:'my password hunter2'}]}],settings:{instructions:'token: abc123456'}};
await r.fill('#backup', JSON.stringify(evil)); await r.click('#bLoad'); await r.click('#bLoad');
await r.waitForTimeout(200);
const st2 = JSON.parse(await r.evaluate(()=>localStorage.getItem('brain.mem.v2')));
ok('bad id dropped, forged corpusId dropped', st2.entries.length===2 && st2.entries.find(e=>e.id==='e3').corpusId===null, st2.entries.map(e=>e.id+':'+e.corpusId).join(','));
ok('timestamps clamped', st2.entries.every(e=>e.seen<=8.64e15&&e.created>=0) && st2.sessions[0].ts<=8.64e15);
ok('constructor speaker dropped, secret scrubbed', st2.sessions[0].msgs.length===1 && !/hunter2/.test(JSON.stringify(st2)) && !/abc123456/.test(JSON.stringify(st2)));
await r.reload(); ok('boots after hostile import', (await r.locator('#memCount').innerText()).toLowerCase().includes('2 entries'));
// spoof: entry e1 (key c:corpus:6) used as memory source -> label comes from CORPUS not the fake title
await r.fill('#q','What does Brain learn from?'); await r.click('#askBtn');
await r.waitForFunction(()=>!document.querySelector('#askBtn').disabled && !document.querySelector('#brain').classList.contains('learning'), null, {timeout:20000});
const srcCell = await r.locator('.answer table td').nth(1).innerText();
ok('source label not spoofable', !/Fake title/.test(srcCell), srcCell);
await ctx2.close();
// same-length corrections reuse
const ctx3 = await b.newContext({ viewport: { width: 1280, height: 900 } });
const u = await ctx3.newPage(); await u.goto(PAGE); await u.selectOption('#speed','0');
await u.fill('#q','Does Brain send messages or take actions?'); await u.click('#askBtn');
await u.waitForFunction(()=>document.querySelector('#runBadge').textContent==='runs: 1' && !document.querySelector('#brain').classList.contains('learning') && document.querySelector('#runReport').textContent.length>0);
await u.click('#tab-mem');
const cardU = u.locator('.entry').filter({ has: u.locator('.ttl', { hasText: /^Memory only$/ }) });
await cardU.getByRole('button',{name:'Correct'}).click(); await u.locator('.entry input[type=text]').first().fill('Brain may send messages or take actions hourly.'); await u.getByRole('button',{name:'Save correction'}).click();
await u.click('#tab-chat'); await u.fill('#q','Does Brain send messages or take actions?'); await u.click('#askBtn');
await u.waitForFunction(()=>!document.querySelector('#askBtn').disabled && !document.querySelector('#brain').classList.contains('learning'), null, {timeout:20000});
const a1 = await u.locator('.answer').last().innerText(); ok('first correction used', /actions hourly/.test(a1));
await u.click('#tab-mem'); await cardU.getByRole('button',{name:'Correct'}).click(); await u.locator('.entry input[type=text]').first().fill('Brain may send messages or take actions weekly.');
await u.getByRole('button',{name:'Save correction'}).click();
await u.click('#tab-chat'); await u.fill('#q','Does Brain send messages or take actions?'); await u.click('#askBtn');
await u.waitForFunction(()=>!document.querySelector('#askBtn').disabled && !document.querySelector('#brain').classList.contains('learning'), null, {timeout:20000});
const a2 = await u.locator('.answer').last().innerText(); ok('second same-length correction used (cache)', /actions weekly/.test(a2) && !/actions hourly/.test(a2));
// correction no longer mentions 'messages' -> should not answer a messages question via old tags
await u.click('#tab-mem'); await cardU.getByRole('button',{name:'Correct'}).click(); await u.locator('.entry input[type=text]').first().fill('Brain is blue.');
await u.getByRole('button',{name:'Save correction'}).click();
await u.click('#tab-chat'); await u.fill('#q','Does Brain send messages or take actions?'); await u.click('#askBtn');
await u.waitForFunction(()=>!document.querySelector('#askBtn').disabled && !document.querySelector('#brain').classList.contains('learning'), null, {timeout:20000});
const a3 = await u.locator('.answer').last().innerText(); ok('corrected text without keywords is not cited for them', !/Brain is blue/.test(a3), a3.slice(0,120));
// delete skill 'claude'-like title doesn't cross-block: delete entity Claude must not block ... (titles differ now) skip
// tab keys
await u.focus('#tab-chat'); await u.keyboard.press('ArrowRight'); ok('arrow key moves tab', (await u.getAttribute('#tab-mem','aria-selected'))==='true');
await ctx3.close();

// phone
const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
const q = await c2.newPage(); q.on('pageerror', e=>errs.push('PAGEERR390 '+e.message)); q.on('console', m => { if (m.type()==='error') errs.push('390:'+m.text()); });
await q.goto(PAGE); await q.selectOption('#speed','0');
await q.click('#modeGraph'); await q.waitForTimeout(800);
await q.click('#tab-mem'); await q.waitForTimeout(200);
ok('phone no hscroll', !(await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
console.log('ERRORS', JSON.stringify(errs));
console.log(failed ? failed+' CHECK(S) FAILED' : 'ALL CHECKS PASSED');
if (failed || errs.length) process.exitCode = 1;
await b.close();
