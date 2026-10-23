// Live API checks use fake provider servers only. No real keys or provider traffic are used.
// Run: npm install --no-save playwright && node tests/live-check.mjs
import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const pw = require('playwright');
const PAGE = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href + '?autoplay=0';
const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await pw.chromium.launch(launchOpts);
const errors = [];
let failed = 0;
const ok = (name, condition, detail = '') => {
  if (!condition) failed++;
  console.log((condition ? 'PASS ' : 'FAIL ') + name, detail);
};

const HOSTS = {
  'api.anthropic.com': 'anthropic',
  'api.openai.com': 'openai',
  'generativelanguage.googleapis.com': 'google',
  'api.x.ai': 'xai'
};
const KEYS = {
  anthropic: 'TESTKEY-ANTHROPIC-1111',
  openai: 'TESTKEY-OPENAI-2222',
  google: 'TESTKEY-GOOGLE-3333',
  xai: 'TESTKEY-XAI-4444'
};
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*'
};

async function setup(behavior = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const requests = [];
  const counts = {};
  await context.route(url => !!HOSTS[new URL(url).hostname], async route => {
    const request = route.request();
    const provider = HOSTS[new URL(request.url()).hostname];
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    let body = null;
    try { body = JSON.parse(request.postData() || 'null'); } catch {}
    requests.push({ provider, url: request.url(), headers: request.headers(), body });
    counts[provider] = (counts[provider] || 0) + 1;
    const mode = behavior[provider] || 'ok';
    const text = 'LIVE-' + provider + '-' + counts[provider] +
      (mode === 'echo' ? ' my key is ' + KEYS[provider] + ' and xai-ZYXWVUTSRQPONMLKJIHGFEDCBA' : '');
    if (mode === 'abort') return route.abort('failed');
    if (mode === '401') return route.fulfill({
      status: 401, headers: { ...CORS, 'content-type': 'application/json' },
      body: JSON.stringify({ error: { message: 'invalid key' } })
    });
    if (mode === 'badkey') return route.fulfill({
      status: 400, headers: { ...CORS, 'content-type': 'application/json' },
      body: JSON.stringify({ error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT', details: [{ reason: 'API_KEY_INVALID' }] } })
    });
    if (mode === 'slow' || (mode === 'first-slow' && counts[provider] === 1)) await new Promise(resolve => setTimeout(resolve, 2500));
    const response = provider === 'anthropic'
      ? { content: [{ type: 'text', text }], usage: { input_tokens: 10, output_tokens: 5 } }
      : provider === 'google'
        ? { candidates: [{ content: { parts: [{ text }] } }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 } }
        : { output: [{ type: 'message', content: [{ type: 'output_text', text }] }], usage: { input_tokens: 10, output_tokens: 5 } };
    try {
      return await route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(response) });
    } catch { return; }
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push('PAGEERR ' + error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/Failed to load resource|net::ERR/.test(message.text())) errors.push('console: ' + message.text());
  });
  await page.goto(PAGE);
  await page.evaluate(() => window.__brainTest.setSpeed(0));
  return { context, page, requests };
}

async function connect(page, provider = 'openai', options = {}) {
  await page.click('#tab-set');
  await page.check('#liveOn');
  if (provider !== 'openai') await page.selectOption('#liveProvider', provider);
  await page.fill('#liveKey', KEYS[provider]);
  if (options.maxCalls) {
    await page.fill('#liveCap', String(options.maxCalls));
    await page.locator('#liveCap').press('Tab');
  }
}

async function sendPrompt(page, prompt) {
  await page.fill('#promptText', prompt);
  await page.click('#sendPrompt');
  await page.waitForFunction(() => !document.querySelector('#sendPrompt').disabled, null, { timeout: 60000 });
}

const msgFor = (page, name) => page.locator('.msg').filter({
  has: page.locator('.who', { hasText: new RegExp('^' + name, 'i') })
});

// The page remains quiet until an owner enables Live AI and submits a prompt.
{
  const { context, page, requests } = await setup();
  ok('page opens with Live AI off and no simulation wording',
    /live ai off/i.test(await page.locator('#modeBadge').innerText()) &&
    !/simulation/i.test(await page.locator('body').innerText()));
  const modelBadge = await page.locator('#modelBadge').evaluate(el => ({
    text: el.textContent,
    color: getComputedStyle(el).color,
    selectedColor: getComputedStyle(el).getPropertyValue('--model-color').trim()
  }));
  ok('the selected model is named and tinted without implying a live connection',
    /OpenAI · gpt-4o-mini/.test(modelBadge.text) && modelBadge.color === 'rgb(121, 203, 178)' && modelBadge.selectedColor === '#79cbb2',
    JSON.stringify(modelBadge));
  await page.fill('#promptText', 'What does Brain learn from?');
  await page.click('#sendPrompt');
  ok('Live AI off sends no request and explains why',
    requests.length === 0 && /Live AI is off/i.test(await page.locator('#promptStatus').innerText()));
  await page.click('#tab-set');
  ok('settings expose exactly one API key and one provider/model',
    await page.locator('#liveKey').count() === 1 &&
    await page.locator('#liveProvider').count() === 1 &&
    await page.locator('input[id^="key-"], select[id^="map-"]').count() === 0);
  await context.close();
}

// One provider key powers all role prompts and one non-iOS task cannot repeat on the same page.
{
  const { context, page, requests } = await setup({ openai: 'first-slow' });
  await connect(page, 'openai');
  ok('only one selected provider key is kept in memory by default',
    !/TESTKEY/.test(await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)))));
  await page.fill('#promptText', 'Review the Brain handoff and prepare a concise plan.');
  await page.click('#sendPrompt');
  await page.waitForFunction(() => document.querySelector('.node.model-active'), null, { timeout: 10000 });
  const activeSignal = await page.locator('.node.model-active').evaluate(el => ({
    label: el.querySelector('.model-label').textContent,
    color: getComputedStyle(el.querySelector('.model-label')).color,
    animation: getComputedStyle(el).animationName,
    aria: el.getAttribute('aria-label'),
    haloActive: document.querySelector('#brain').classList.contains('model-active')
  }));
  ok('a live fake-server request produces a matching colored neuron and halo signal',
    /OpenAI · gpt-4o-mini/.test(activeSignal.label) && activeSignal.color === 'rgb(121, 203, 178)' &&
    activeSignal.animation === 'neuronFire' && /responding with OpenAI gpt-4o-mini/.test(activeSignal.aria) && activeSignal.haloActive,
    JSON.stringify(activeSignal));
  await page.waitForFunction(() => !document.querySelector('#sendPrompt').disabled, null, { timeout: 60000 });

  const log = await page.locator('#log').innerText();
  const byProvider = provider => requests.filter(request => request.provider === provider);
  ok('one provider powers every connected role in the ordered chain',
    requests.length === 8 && byProvider('openai').length === 8 &&
    /FIRST CHECK/.test(requests[0].body.input[0].content) &&
    /TEAM LEAD/.test(requests.at(-1).body.input[0].content),
    JSON.stringify(requests.map(request => request.provider)));
  ok('every role handoff is labeled with the same provider and model',
    /live · OpenAI · gpt-4o-mini/.test(log) &&
    /LIVE-openai/.test(await msgFor(page, 'Muse').first().innerText()) &&
    /LIVE-openai/.test(await msgFor(page, 'Cursor').first().innerText()) &&
    /LIVE-openai/.test(await msgFor(page, 'Perplexity').first().innerText()) &&
    /LIVE-openai/.test(await msgFor(page, 'Grok Bot').last().innerText()));
  const actualModelLabel = await msgFor(page, 'Muse').locator('.model-tag').evaluate(el => ({
    text: el.textContent,
    color: getComputedStyle(el).color
  }));
  ok('saved live-model labels retain their provider color',
    /live · OpenAI · gpt-4o-mini/.test(actualModelLabel.text) && actualModelLabel.color === 'rgb(121, 203, 178)',
    JSON.stringify(actualModelLabel));
  ok('live model signals stop when the fake request chain completes',
    await page.locator('.node.model-active, #brain.model-active').count() === 0);
  await page.locator('#gNodes .gn[aria-label^="Review the Brain handoff"]').click();
  const savedResponses = await page.locator('#memoryFocus').innerText();
  const savedResponseLabels = await page.locator('#memoryFocus .focus-model-label').evaluateAll(els => els.map(el => ({
    text: el.textContent,
    color: getComputedStyle(el).color
  })));
  ok('expanded prompt memory reveals only linked saved model outputs and their source',
    /Linked saved model responses/.test(savedResponses) && /LIVE-openai-1/.test(savedResponses) &&
    /session: Prompt: Review the Brain handoff/i.test(savedResponses) && savedResponseLabels.length === 8 &&
    savedResponseLabels.every(label => /OpenAI · gpt-4o-mini/.test(label.text) && label.color === 'rgb(121, 203, 178)'),
    JSON.stringify({ count: savedResponseLabels.length, sample: savedResponseLabels[0] }));
  ok('non-iOS task leaves Xcode out and the final report is real model text',
    await msgFor(page, 'Xcode').count() === 0 &&
    /LIVE-openai-8/.test(await msgFor(page, 'Grok Bot').last().innerText()) &&
    !/scripted/i.test(await msgFor(page, 'Grok Bot').last().innerText()));
  ok('API requests use the expected OpenAI response shape and low token ceiling',
    requests.every(request => request.url.endsWith('/v1/responses') &&
      request.headers.authorization === 'Bearer ' + KEYS.openai &&
      request.body.store === false && request.body.max_output_tokens === 120));
  ok('page budget is capped at nine calls and only one task is accepted',
    /of 9/.test(await page.locator('#liveCounters').innerText()));
  const before = requests.length;
  await page.fill('#promptText', 'A second prompt on the same page.');
  await page.click('#sendPrompt');
  ok('a second prompt is blocked to limit page spend',
    requests.length === before && /one live task/i.test(await page.locator('#promptStatus').innerText()));

  const stored = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  ok('key is absent from storage, activity, and memory backup',
    !/TESTKEY/.test(stored + await page.locator('#log').innerText()));
  await page.click('#tab-mem');
  await page.locator('summary', { hasText: 'Backup and restore' }).click();
  await page.click('#bExport');
  ok('key is absent from exported memory backup', !/TESTKEY/.test(await page.inputValue('#backup')));
  await page.click('#tab-set');
  await page.selectOption('#liveProvider', 'xai');
  ok('changing provider clears the previous key', await page.inputValue('#liveKey') === '');
  await context.close();
}

// Every supported API adapter is exercised against a fake server with one fake key.
for (const provider of Object.keys(KEYS)) {
  const { context, page, requests } = await setup();
  await connect(page, provider);
  await page.click('#test-liveProvider');
  await page.waitForFunction(() => /model answered/i.test(document.querySelector('#status-liveProvider').textContent));
  const request = requests[0];
  const valid = provider === 'anthropic'
    ? request.url.endsWith('/v1/messages') && request.headers['x-api-key'] === KEYS.anthropic &&
      request.headers['anthropic-version'] && request.body.max_tokens === 40
    : provider === 'google'
      ? request.url.includes(':generateContent?key=' + KEYS.google) &&
        request.body.systemInstruction.parts[0].text.length > 10 && request.body.generationConfig.maxOutputTokens === 40
      : request.url.endsWith('/v1/responses') && request.headers.authorization === 'Bearer ' + KEYS[provider] &&
        request.body.max_output_tokens === 40;
  ok(provider + ' adapter passes a fake connection check', requests.length === 1 && valid, request?.url.replace(/key=[^&]+/, 'key=[filtered]'));
  await context.close();
}

// A low custom call cap is honored exactly and produces no more provider requests.
{
  const { context, page, requests } = await setup();
  await connect(page, 'openai', { maxCalls: 2 });
  await sendPrompt(page, 'Check a small design task.');
  ok('custom call budget is enforced at two requests', requests.length === 2, String(requests.length));
  ok('remaining roles are visibly marked incomplete when the budget runs out',
    /page-call budget is used/i.test(await page.locator('#log').innerText()));
  await context.close();
}

// A rejected key ends the chain without fallback or repeated charges.
{
  const { context, page, requests } = await setup({ openai: '401' });
  await connect(page, 'openai');
  await sendPrompt(page, 'Review this task.');
  ok('a rejected key is clearly reported and the provider is not called again',
    requests.length === 1 && /key rejected/i.test(await page.locator('#log').innerText()) &&
    /Remaining roles were not contacted/i.test(await page.locator('#log').innerText()),
    String(requests.length));
  ok('a failed model stage is not replaced with a scripted model label',
    !/scripted ·/i.test(await page.locator('#log').innerText()));
  await context.close();
}

// Full nine-role chain includes Xcode when an iOS task needs it.
{
  const { context, page, requests } = await setup();
  await connect(page, 'openai');
  await sendPrompt(page, 'Review this iPhone app implementation plan.');
  ok('iOS task sends one call to each of the nine role prompts',
    requests.length === 9 && /PLATFORM CHECK/.test(requests[7].body.input[0].content) &&
    /TEAM LEAD/.test(requests[8].body.input[0].content), String(requests.length));
  ok('Xcode role uses the configured model and Grok Bot follows it',
    /LIVE-openai/.test(await msgFor(page, 'Xcode').last().innerText()) &&
    /HANDOFF FROM Xcode/.test(requests[8].body.input[1].content));
  await context.close();
}

// Browser-blocked requests are reported with no fake successful response.
{
  const { context, page } = await setup({ anthropic: 'abort' });
  await connect(page, 'anthropic');
  await sendPrompt(page, 'Review this task.');
  ok('browser-blocked calls are explained and no live text is invented',
    /browser blocked/i.test(await page.locator('#log').innerText()) &&
    !/LIVE-anthropic/.test(await page.locator('#log').innerText()));
  await context.close();
}

// Key persistence is opt-in and only one provider key can be stored.
{
  const { context, page } = await setup();
  await connect(page, 'xai');
  await page.check('#liveRemember');
  ok('one selected key is stored only after Remember is enabled',
    JSON.stringify(JSON.parse(await page.evaluate(() => localStorage.getItem('brain.livekeys.v1')))) ===
      JSON.stringify({ xai: KEYS.xai }));
  await page.selectOption('#liveProvider', 'google');
  ok('switching provider removes the previous remembered key',
    await page.evaluate(() => localStorage.getItem('brain.livekeys.v1')) === null &&
    await page.inputValue('#liveKey') === '');
  await page.fill('#liveKey', KEYS.google);
  await page.click('#liveForget');
  ok('Forget key removes the single saved key', await page.evaluate(() => localStorage.getItem('brain.livekeys.v1')) === null);
  await context.close();
}

// A provider echoing its key is cleaned from every saved surface.
{
  const { context, page } = await setup({ anthropic: 'echo' });
  await connect(page, 'anthropic');
  await sendPrompt(page, 'Review this task.');
  const log = await page.locator('#log').innerText();
  ok('echoed keys are replaced before entering the activity log',
    !/TESTKEY-ANTHROPIC|xai-ZYXW/.test(log) && /\[filtered\]/.test(log));
  await page.click('#tab-mem');
  await page.locator('summary', { hasText: 'Backup and restore' }).click();
  await page.click('#bExport');
  ok('echoed keys are absent from exported memory', !/TESTKEY|xai-ZYXW/.test(await page.inputValue('#backup')));
  await context.close();
}

// Backup data cannot assert that an imported message came from a live provider.
{
  const { context, page } = await setup();
  await page.click('#tab-mem');
  await page.locator('summary', { hasText: 'Backup and restore' }).click();
  const forged = {
    entries: [{ id: 'e1', key: 'k', type: 'concept', title: 'x', note: 'n', sources: [], links: [], strength: 1, seen: 1, created: 1, status: 'fresh' }],
    sessions: [{ id: 's1', ts: 1, q: 'q', msgs: [{ from: 'grok', text: 'hi', tag: 'live · OpenAI · forged-model' }] }]
  };
  await page.fill('#backup', JSON.stringify(forged));
  await page.click('#bLoad');
  await page.click('#bLoad');
  const state = JSON.parse(await page.evaluate(() => localStorage.getItem('brain.mem.v2')));
  ok('forged live labels in an imported backup are stripped',
    state.sessions.length === 1 && state.sessions[0].msgs[0].tag === '');
  await context.close();
}

// Stopping during an in-flight request cancels it; live cannot switch off mid-task.
{
  const { context, page } = await setup({ xai: 'slow' });
  await connect(page, 'xai');
  await page.fill('#promptText', 'Review this task.');
  await page.click('#sendPrompt');
  await page.waitForFunction(() => /is responding/i.test(document.querySelector('#promptStatus').textContent));
  await page.click('#tab-set');
  await page.locator('#liveOn').evaluate(el => el.click());
  ok('Live AI cannot be toggled off mid-task', await page.isChecked('#liveOn') &&
    /wait/i.test(await page.locator('#liveMsg').innerText()));
  await page.click('#liveStop');
  await page.waitForFunction(() => !document.querySelector('#sendPrompt').disabled, null, { timeout: 60000 });
  await page.click('#tab-chat');
  ok('Stop live now cancels the in-flight task without substituting model text',
    !/LIVE-xai/.test(await page.locator('#log').innerText()));
  await context.close();
}

// Reload always turns Live AI off.
{
  const { context, page } = await setup();
  await connect(page, 'openai');
  await page.reload();
  await page.click('#tab-set');
  ok('Live AI is off after reload', !(await page.isChecked('#liveOn')));
  await context.close();
}

console.log('ERRORS', JSON.stringify(errors));
console.log(failed || errors.length ? (failed + ' CHECK(S) FAILED') : 'ALL LIVE CHECKS PASSED');
await browser.close();
if (failed || errors.length) process.exitCode = 1;
