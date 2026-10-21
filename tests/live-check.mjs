// Live-mode check. It does NOT call any real AI company. A fake server stands in for each of the four providers
// (Anthropic, OpenAI, Google, xAI) and answers in that provider's reply format. This checks how the page builds its
// requests, labels messages, counts calls, protects keys, and stops. It cannot prove the real services accept the requests.
// Run:  npm install --no-save playwright   then   node tests/live-check.mjs      (CHROMIUM_PATH=... to use your own browser)
import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const PAGE = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href + '?autoplay=0';
const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const b = await pw.chromium.launch(launchOpts);
const errs = [];
let failed = 0;
const ok = (n, c, x = '') => { if (!c) failed++; console.log((c ? 'PASS ' : 'FAIL ') + n, x); };

const HOSTS = { 'api.anthropic.com': 'anthropic', 'api.openai.com': 'openai', 'generativelanguage.googleapis.com': 'google', 'api.x.ai': 'xai' };
const KEYS = { anthropic: 'TESTKEY-ANTHROPIC-1111', openai: 'TESTKEY-OPENAI-2222', google: 'TESTKEY-GOOGLE-3333', xai: 'TESTKEY-XAI-4444' };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

async function setup(behaviour = {}) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const reqs = [];
  const counter = {};
  await ctx.route(u => !!HOSTS[new URL(u).hostname], async (route) => {
    const req = route.request(), prov = HOSTS[new URL(req.url()).hostname];
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    let body = null; try { body = JSON.parse(req.postData() || 'null'); } catch (e) {}
    reqs.push({ prov, url: req.url(), headers: req.headers(), body });
    counter[prov] = (counter[prov] || 0) + 1;
    const mode = behaviour[prov] || 'ok', text = 'LIVE-' + prov + '-' + counter[prov];
    if (mode === 'abort') return route.abort('failed');
    if (mode === '401') return route.fulfill({ status: 401, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify({ error: { message: 'invalid key' } }) });
    const shape = prov === 'anthropic' ? { content: [{ type: 'text', text }], usage: { input_tokens: 10, output_tokens: 5 } }
      : prov === 'google' ? { candidates: [{ content: { parts: [{ text }] } }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 } }
      : { output: [{ type: 'message', content: [{ type: 'output_text', text }] }], usage: { input_tokens: 10, output_tokens: 5 } };
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(shape) });
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(PAGE); await p.selectOption('#speed', '0');
  return { ctx, p, reqs };
}
async function enableLive(p, extra = {}) {
  await p.click('#tab-set');
  await p.check('#liveOn');
  for (const prov of Object.keys(KEYS)) await p.fill('#key-' + prov, KEYS[prov]);
  if (extra.cap) { await p.fill('#liveCap', String(extra.cap)); await p.press('#liveCap', 'Tab'); }
}
const runTask = async (p, q) => { await p.getByRole('button', { name: q, exact: true }).click(); await p.waitForFunction(() => /done/.test(document.querySelector('#taskStatus').textContent), null, { timeout: 60000 }); };
const Q = 'What does Brain learn from?';
const msgFor = (p, name) => p.locator('.msg').filter({ has: p.locator('.who', { hasText: new RegExp('^' + name, 'i') }) });

// 1) live OFF: nothing leaves the page
{
  const { ctx, p, reqs } = await setup();
  await runTask(p, Q);
  ok('live off: no request goes to any provider', reqs.length === 0, String(reqs.length));
  ok('live off: badge says simulation', /simulation/i.test(await p.locator('#modeBadge').innerText()));
  await ctx.close();
}

// 2) live ON: request shapes, labels, key safety
{
  const { ctx, p, reqs } = await setup();
  await enableLive(p);
  ok('badge says live and you pay', /live/i.test(await p.locator('#modeBadge').innerText()) && /pay/i.test(await p.locator('#modeBadge').innerText()), await p.locator('#modeBadge').innerText());
  await runTask(p, Q);
  const by = (pv) => reqs.filter(r => r.prov === pv);
  const a = by('anthropic')[0], o = by('openai')[0], g = by('google')[0], x = by('xai')[0];
  ok('Anthropic request is built right', !!a && a.url.endsWith('/v1/messages') && a.headers['x-api-key'] === KEYS.anthropic && !!a.headers['anthropic-version'] && a.headers['anthropic-dangerous-direct-browser-access'] === 'true'
    && a.body.model === 'claude-haiku-5-5' && a.body.max_tokens === 300 && typeof a.body.system === 'string' && a.body.messages[0].role === 'user');
  ok('OpenAI request is built right', !!o && o.url.endsWith('/v1/responses') && o.headers.authorization === 'Bearer ' + KEYS.openai && o.body.input[0].role === 'system' && o.body.input[1].role === 'user' && o.body.max_output_tokens === 300);
  ok('xAI request is built right', !!x && x.url === 'https://api.x.ai/v1/responses' && x.headers.authorization === 'Bearer ' + KEYS.xai && o.body.model !== x.body.model && x.body.max_output_tokens === 300);
  ok('Google request is built right', !!g && g.url.includes(':generateContent?key=' + KEYS.google) && g.body.systemInstruction.parts[0].text.length > 10 && g.body.generationConfig.maxOutputTokens === 300 && !g.headers.authorization);
  ok('at most 8 calls for one task', reqs.length > 0 && reqs.length <= 8, String(reqs.length));
  ok('exactly 6 calls: Grok 2, Claude 2, ChatGPT 1, Gemini 1 (Cursor and Muse make none)', by('xai').length === 2 && by('anthropic').length === 2 && by('openai').length === 1 && by('google').length === 1 && reqs.length === 6, JSON.stringify(reqs.map(r => r.prov)));
  const claudeMsg = await msgFor(p, 'Claude').first().innerText(), grokMsgs = await msgFor(p, 'Grok').allInnerTexts(), chatMsg = await msgFor(p, 'ChatGPT').last().innerText(), gemMsg = await msgFor(p, 'Gemini').first().innerText();
  ok('Claude speaks through Anthropic and says so', /LIVE-anthropic/.test(claudeMsg) && /live · Anthropic · claude-haiku-5-5/i.test(claudeMsg));
  ok('Grok speaks through xAI, and the page-computed sign-off is still there', grokMsgs.some(t => /LIVE-xai/.test(t)) && grokMsgs.some(t => /Sign-off: PASS/.test(t)));
  ok('ChatGPT speaks through OpenAI', /LIVE-openai/.test(chatMsg) && /live · OpenAI/i.test(chatMsg));
  ok('Gemini speaks through Google', /LIVE-google/.test(gemMsg) && /live · Google/i.test(gemMsg));
  const cursorMsg = await msgFor(p, 'Cursor').first().innerText(), museMsg = await msgFor(p, 'Muse').first().innerText();
  ok('Cursor and Muse stay scripted and say so', /scripted/i.test(cursorMsg) && /scripted/i.test(museMsg) && !/LIVE-/.test(cursorMsg + museMsg));
  ok('the cited answer is still built and checked by the page', (await p.locator('.answer .cite').count()) >= 1 && !/LIVE-/.test(await p.locator('.answer').last().innerText()));
  // key safety
  const stored = await p.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  ok('keys are not saved in this browser by default', !/TESTKEY/.test(stored), '');
  await p.click('#tab-mem'); await p.locator('summary', { hasText: 'Backup' }).click(); await p.click('#bExport');
  ok('keys are not in the memory backup', !/TESTKEY/.test(await p.inputValue('#backup')));
  await p.click('#tab-chat');
  ok('keys are not in the activity log', !/TESTKEY/.test(await p.locator('#log').innerText()));
  // counters and test button
  await p.click('#tab-set');
  ok('call counter shows the calls', new RegExp('Calls this page load: ' + reqs.length + ' of 60').test(await p.locator('#liveCounters').innerText()), await p.locator('#liveCounters').innerText());
  const before = reqs.length; await p.click('#test-anthropic'); await p.waitForFunction(() => /Works/.test(document.querySelector('#status-anthropic').textContent));
  ok('Test button makes one call and reports', reqs.length === before + 1);
  // autopilot waits while live
  await p.click('#playBtn'); await p.waitForTimeout(2500);
  ok('autopilot does not start tasks by itself in live mode', /waits|press next task/i.test(await p.locator('#taskStatus').innerText()) && reqs.length === before + 1, await p.locator('#taskStatus').innerText());
  await p.click('#playBtn');
  // stop button
  await p.click('#liveStop'); const afterStop = reqs.length;
  await p.getByRole('button', { name: 'Next task' }).click(); await p.waitForFunction(() => /done/.test(document.querySelector('#taskStatus').textContent), null, { timeout: 60000 });
  ok('Stop live now stops every call', reqs.length === afterStop, String(reqs.length - afterStop));
  await p.reload(); await p.click('#tab-set');
  ok('after a reload live mode is off again', !(await p.isChecked('#liveOn')));
  await ctx.close();
}

// 3) call limit
{
  const { ctx, p, reqs } = await setup();
  await enableLive(p, { cap: 2 });
  await runTask(p, Q);
  ok('the call limit is enforced', reqs.length === 2, String(reqs.length));
  ok('the page says the limit was reached', /limit/i.test(await p.locator('#log').innerText()));
  await ctx.close();
}

// 4) key rejected (401): that provider is switched off, no more calls to it
{
  const { ctx, p, reqs } = await setup({ openai: '401' });
  await enableLive(p);
  await runTask(p, Q);
  const n1 = reqs.filter(r => r.prov === 'openai').length;
  ok('a rejected key is reported in plain words', /key rejected/i.test(await p.locator('#log').innerText()));
  ok('ChatGPT falls back to scripted text', /scripted/i.test(await msgFor(p, 'ChatGPT').last().innerText()));
  await p.getByRole('button', { name: 'What does a Brain run do?', exact: true }).click(); await p.waitForFunction(() => /Task 2 done/.test(document.querySelector('#taskStatus').textContent), null, { timeout: 60000 });
  ok('no more calls go to a provider whose key was rejected', reqs.filter(r => r.prov === 'openai').length === n1, n1 + ' -> ' + reqs.filter(r => r.prov === 'openai').length);
  await ctx.close();
}

// 5) browser blocks the call
{
  const { ctx, p } = await setup({ anthropic: 'abort' });
  await enableLive(p);
  await runTask(p, Q);
  ok('a blocked call is explained and falls back', /browser blocked/i.test(await p.locator('#log').innerText()) && /scripted/i.test(await msgFor(p, 'Claude').first().innerText()));
  await ctx.close();
}

// 6) remember keys is opt-in and Forget clears it
{
  const { ctx, p } = await setup();
  await enableLive(p);
  await p.check('#liveRemember');
  ok('keys are saved only after the Remember box is ticked', /TESTKEY-ANTHROPIC/.test(await p.evaluate(() => localStorage.getItem('brain.livekeys.v1') || '')));
  await p.click('#liveForget');
  ok('Forget keys removes them', (await p.evaluate(() => localStorage.getItem('brain.livekeys.v1'))) === null && (await p.inputValue('#key-anthropic')) === '');
  await ctx.close();
}

console.log('ERRORS', JSON.stringify(errs));
console.log(failed ? failed + ' CHECK(S) FAILED' : 'ALL LIVE CHECKS PASSED');
await b.close();
if (failed || errs.length) process.exitCode = 1;
