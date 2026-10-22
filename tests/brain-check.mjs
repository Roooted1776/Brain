// Brain page check. Opens index.html in a real browser (Playwright) and tries the main things.
// Run it:  npm install --no-save playwright   then   node tests/brain-check.mjs
// Optional: set CHROMIUM_PATH to use a browser you already have. Prints PASS/FAIL lines and ERRORS [].
import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const PAGE = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href + '?autoplay=0';
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
const settle = async (expectRun=true) => { await p.waitForFunction(()=>!document.querySelector('#nextBtn').disabled);
  if (expectRun) { N++; await p.waitForFunction((n)=>document.querySelector('#runBadge').textContent==='runs: '+n && !document.querySelector('#brain').classList.contains('learning') && document.querySelector('#runReport').textContent.length>0, N, {timeout:20000}); }
  else await p.waitForTimeout(300); };
const chip = (pg, q) => pg.getByRole('button', { name: q, exact: true }).click();
const waitRuns = (pg, n) => pg.waitForFunction((k)=>document.querySelector('#runBadge').textContent==='runs: '+k && !document.querySelector('#brain').classList.contains('learning') && document.querySelector('#runReport').textContent.length>0, n, {timeout:20000});
const ask = async (q, expectRun=true) => { await chip(p, q); await settle(expectRun); };
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
await p.click('#tab-set'); await p.check('#incog'); await ask('Who decides what ships and who merges?', false); await p.click('#tab-set'); await p.uncheck('#incog');
const nSess2 = await p.evaluate(()=>JSON.parse(localStorage.getItem('brain.mem.v2')).sessions.length);
ok('incognito not saved', nSess===nSess2 && (await runs())===before, nSess+' -> '+nSess2);
// secret filter
await p.click('#tab-mem'); await p.fill('#aTitle','probe'); await p.fill('#aNote','my password is hunter2 and api_key=sk-abcdefghijklmnop'); await p.click('#addForm button[type=submit]');
ok('secret filtered + warned', /password or key/.test(await p.locator('#addWarn').innerText()));
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
await r.selectOption('#speed','0'); await chip(r, 'What does Brain learn from?'); await waitRuns(r, 1);
const srcCell = await r.locator('.answer table td').nth(1).innerText();
ok('source label not spoofable', !/Fake title/.test(srcCell), srcCell);
await ctx2.close();
// same-length corrections reuse
const ctx3 = await b.newContext({ viewport: { width: 1280, height: 900 } });
const u = await ctx3.newPage(); await u.goto(PAGE); await u.selectOption('#speed','0');
await chip(u, 'Does Brain send messages or take actions?');
await u.waitForFunction(()=>document.querySelector('#runBadge').textContent==='runs: 1' && !document.querySelector('#brain').classList.contains('learning') && document.querySelector('#runReport').textContent.length>0);
await u.click('#tab-mem');
const cardU = u.locator('.entry').filter({ has: u.locator('.ttl', { hasText: /^Memory only$/ }) });
await cardU.getByRole('button',{name:'Correct'}).click(); await u.locator('.entry input[type=text]').first().fill('Brain may send messages or take actions hourly.'); await u.getByRole('button',{name:'Save correction'}).click();
await u.click('#tab-chat'); await chip(u, 'Does Brain send messages or take actions?'); await waitRuns(u, 2);
const a1 = await u.locator('.answer').last().innerText(); ok('first correction used', /actions hourly/.test(a1));
await u.click('#tab-mem'); await cardU.getByRole('button',{name:'Correct'}).click(); await u.locator('.entry input[type=text]').first().fill('Brain may send messages or take actions weekly.');
await u.getByRole('button',{name:'Save correction'}).click();
await u.click('#tab-chat'); await chip(u, 'Does Brain send messages or take actions?'); await waitRuns(u, 3);
const a2 = await u.locator('.answer').last().innerText(); ok('second same-length correction used (cache)', /actions weekly/.test(a2) && !/actions hourly/.test(a2));
// correction no longer mentions 'messages' -> should not answer a messages question via old tags
await u.click('#tab-mem'); await cardU.getByRole('button',{name:'Correct'}).click(); await u.locator('.entry input[type=text]').first().fill('Brain is blue.');
await u.getByRole('button',{name:'Save correction'}).click();
await u.click('#tab-chat'); await chip(u, 'Does Brain send messages or take actions?'); await waitRuns(u, 4);
const a3 = await u.locator('.answer').last().innerText(); ok('corrected text without keywords is not cited for them', !/Brain is blue/.test(a3), a3.slice(0,120));
// delete skill 'claude'-like title doesn't cross-block: delete entity Claude must not block ... (titles differ now) skip
// tab keys
await u.focus('#tab-chat'); await u.keyboard.press('ArrowRight'); ok('arrow key moves tab', (await u.getAttribute('#tab-mem','aria-selected'))==='true');
await ctx3.close();

// ---- the default view: a brain-shaped memory graph, drawn fast ----
{
  const gctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  const g = await gctx.newPage(); g.on('pageerror', e=>errs.push('PAGEERR-g '+e.message));
  await g.goto(PAGE); await g.waitForTimeout(1200);
  ok('the memory graph is the default view', (await g.getAttribute('#stage','data-mode')) === 'graph' && (await g.getAttribute('#modeGraph','aria-pressed')) === 'true');
  ok('a brain outline is drawn behind the dots', (await g.locator('#gShape path.outline').count()) === 1 && (await g.locator('#gShape text').count()) === 3);
  const sbox = await g.locator('#stage').boundingBox(), ob = await g.locator('#gShape path.outline').boundingBox();
  ok('the brain outline sits inside the stage', ob.x >= sbox.x - 2 && ob.x + ob.width <= sbox.x + sbox.width + 2 && ob.y >= sbox.y - 2 && ob.y + ob.height <= sbox.y + sbox.height + 2);
  ok('lines are drawn as shapes, not as hundreds of separate lines', (await g.locator('#gEdges line').count()) === 0 && (await g.locator('#gEdges path').count()) === 3);
  const dots = await g.locator('#gNodes .gn .hit').evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
  ok('every dot is inside the stage', dots.length > 0 && dots.every(([x, y]) => x >= sbox.x && x <= sbox.x + sbox.width && y >= sbox.y && y <= sbox.y + sbox.height), String(dots.length));
  // a big memory stays smooth
  const big = []; for (let i = 1; i <= 400; i++) big.push({ id: 'e' + i, key: 'k' + i, type: ['concept','entity','workstream'][i % 3], title: 'Entry ' + i, note: 'n', sources: [], links: i > 3 ? ['e' + (i - 1), 'e' + (i - 3)] : [], strength: 1 + (i % 5), seen: Date.now(), created: Date.now() + i, status: 'fresh' });
  await g.evaluate(([e]) => localStorage.setItem('brain.mem.v2', JSON.stringify({ version: 2, entries: e, sessions: [], blocked: [], runs: 0, dayShift: 0, settings: {} })), [big]);
  await g.reload(); await g.waitForTimeout(2500);
  const fps = await g.evaluate(() => new Promise(res => { let n = 0, t0 = 0; function f(t) { if (!t0) t0 = t; n++; if (t - t0 < 2000) requestAnimationFrame(f); else res(Math.round(n / ((t - t0) / 1000))); } requestAnimationFrame(f); }));
  ok('400 memories still draw smoothly (30 frames a second or more)', fps >= 30, fps + ' fps');
  await gctx.close();
}
// ---- the living network ----
const nctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const n = await nctx.newPage(); n.on('pageerror', e=>errs.push('PAGEERR-net '+e.message)); n.on('console', m => { if (m.type()==='error') errs.push('net:'+m.text()); });
await n.goto(PAGE); await n.selectOption('#speed','0');
const cx = async (loc) => { const bb = await loc.boundingBox(); return { x: bb.x + bb.width/2, y: bb.y + bb.height/2 }; };
await n.click('#tab-chat'); await n.click('#modeTeam'); await n.waitForTimeout(600);
await n.click('#center'); await n.waitForTimeout(1500);
const claude = n.locator('.node', { hasText: 'Claude' });
const c0 = await cx(claude);
await n.mouse.move(c0.x, c0.y); await n.mouse.down(); await n.mouse.move(c0.x + 140, c0.y + 40, { steps: 8 }); await n.mouse.up();
await n.waitForTimeout(1800);
const c1 = await cx(claude);
ok('a bot can be dragged and stays where dropped', Math.abs(c1.x - (c0.x + 140)) < 30 && Math.abs(c1.y - (c0.y + 40)) < 30, JSON.stringify([Math.round(c1.x-c0.x), Math.round(c1.y-c0.y)]));
await n.click('#center'); await n.waitForTimeout(2200);
const cBack = await cx(claude);
ok('Reset layout brings the bot back', Math.abs(cBack.x - c0.x) < 30 && Math.abs(cBack.y - c0.y) < 30, JSON.stringify([Math.round(cBack.x-c0.x), Math.round(cBack.y-c0.y)]));
await n.uncheck('#driftToggle'); await n.waitForTimeout(1500);
const d1 = await cx(claude); await n.waitForTimeout(1200); const d2 = await cx(claude);
ok('Drift off holds still', Math.abs(d1.x-d2.x) < 1.5 && Math.abs(d1.y-d2.y) < 1.5);
await n.check('#driftToggle'); await n.waitForTimeout(300);
await n.selectOption('#speed','0.35');
await n.evaluate(()=>{ window.__leak = 0; setInterval(()=>{ var t = document.querySelector('#taskStatus').textContent; if (!document.querySelector('#nextBtn').disabled && /running|learning/i.test(t)) window.__leak++; }, 15); });
await chip(n, 'What does Brain learn from?');
await n.waitForSelector('#hand .pkt', { timeout: 15000 }); ok('hand-off packets travel along the lines', true);
await n.waitForFunction(()=>/done/.test(document.querySelector('#taskStatus').textContent), null, {timeout:90000});
ok('Next task stays disabled until the task and the learning finish', (await n.evaluate(()=>window.__leak))===0, String(await n.evaluate(()=>window.__leak)));
await n.selectOption('#speed','0');
// keyboard move and a drop outside the stage
await n.click('#modeTeam'); await n.waitForTimeout(500); await n.click('#center'); await n.waitForTimeout(1500);
const k0 = await cx(claude); await claude.focus(); for (let i = 0; i < 4; i++) await n.keyboard.press('ArrowRight'); await n.waitForTimeout(1300);
const k1 = await cx(claude); ok('arrow keys move a focused bot', k1.x - k0.x > 25, String(Math.round(k1.x - k0.x)));
await n.click('#center'); await n.waitForTimeout(1500); await n.uncheck('#driftToggle');
const sb = await n.locator('#stage').boundingBox(); const o0 = await cx(claude);
await n.mouse.move(o0.x, o0.y); await n.mouse.down(); await n.mouse.move(sb.x + sb.width + 250, sb.y + sb.height + 250, { steps: 10 }); await n.mouse.up();
await n.waitForTimeout(2500);
const cb = await claude.boundingBox();
ok('a bot dropped outside the stage lands inside it', cb.x >= sb.x - 2 && cb.x + cb.width <= sb.x + sb.width + 2 && cb.y >= sb.y - 2 && cb.y + cb.height <= sb.y + sb.height + 2);
const s1 = await cx(claude); await n.waitForTimeout(1200); const s2 = await cx(claude);
ok('and then it settles instead of moving forever', Math.abs(s1.x - s2.x) < 1 && Math.abs(s1.y - s2.y) < 1);
await n.check('#driftToggle'); await n.click('#center'); await n.waitForTimeout(800);
// memory dot drag
await n.click('#modeGraph'); await n.waitForTimeout(1200);
const dot = n.locator('#gNodes .gn').first();
const g0 = await cx(dot.locator('.hit'));
await n.mouse.move(g0.x, g0.y); await n.mouse.down(); await n.mouse.move(g0.x + 60, g0.y + 40, { steps: 6 }); await n.mouse.up();
await n.waitForTimeout(1500);
const g1 = await cx(dot.locator('.hit'));
ok('a memory dot can be dragged and stays', Math.abs(g1.x - (g0.x + 60)) < 25 && Math.abs(g1.y - (g0.y + 40)) < 25, JSON.stringify([Math.round(g1.x-g0.x), Math.round(g1.y-g0.y)]));
await n.click('#modeTeam');
await nctx.close();
// autopilot: with no clicks at all, a task starts by itself
const autoCtx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const au = await autoCtx.newPage(); au.on('pageerror', e=>errs.push('PAGEERR-auto '+e.message));
await au.goto(PAGE.replace('?autoplay=0',''));
await au.waitForFunction(()=>/Task 1/i.test(document.querySelector('#taskStatus').textContent), null, {timeout:15000});
ok('autopilot starts a task with no clicks', true, await au.locator('#taskStatus').innerText());
await au.click('#playBtn'); ok('Pause button works', (await au.locator('#playBtn').innerText()).toLowerCase()==='play');
await autoCtx.close();
const rmCtx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const rm = await rmCtx.newPage(); rm.on('pageerror', e=>errs.push('PAGEERR-rm '+e.message));
await rm.goto(PAGE.replace('?autoplay=0','')); await rm.waitForTimeout(3500);
const rmStatus = await rm.locator('#taskStatus').innerText();
ok('reduced motion: no task starts by itself', /paused/i.test(rmStatus) && !/Task 1/i.test(rmStatus), rmStatus);
await rmCtx.close();

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
