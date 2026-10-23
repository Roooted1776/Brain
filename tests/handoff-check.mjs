import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const pw = require('playwright');
const PAGE = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href + '?autoplay=0';
const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await pw.chromium.launch(launchOpts);
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const hosts = { 'api.anthropic.com': 'anthropic', 'api.openai.com': 'openai', 'generativelanguage.googleapis.com': 'google', 'api.x.ai': 'xai' };
const key = 'TESTKEY-OPENAI-2222';
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const requests = [];
const errors = [];
let failed = 0;
const ok = (name, pass, detail = '') => {
  if (!pass) failed++;
  console.log((pass ? 'PASS ' : 'FAIL ') + name, detail);
};

await context.route(url => !!hosts[new URL(url).hostname], async route => {
  const request = route.request(), provider = hosts[new URL(request.url()).hostname];
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
  let body = {};
  try { body = JSON.parse(request.postData() || '{}'); } catch {}
  requests.push({ provider, body });
  const text = 'FAKE HANDOFF RESPONSE ' + requests.length;
  const response = provider === 'anthropic' ? { content: [{ type: 'text', text }], usage: { input_tokens: 8, output_tokens: 6 } }
    : provider === 'google' ? { candidates: [{ content: { parts: [{ text }] } }], usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 6 } }
    : { output: [{ type: 'message', content: [{ type: 'output_text', text }] }], usage: { input_tokens: 8, output_tokens: 6 } };
  return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(response) });
});

const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource|net::ERR/.test(message.text())) errors.push(message.text()); });

try {
  await page.goto(PAGE);
  await page.evaluate(() => window.__brainTest.setSpeed(0));
  await page.click('#tab-set');
  await page.check('#liveOn');
  await page.selectOption('#liveProvider', 'openai');
  await page.fill('#liveKey', key);

  await page.fill('#promptText', 'Prepare a concise iPhone design change proposal and review the handoffs.');
  await page.click('#sendPrompt');
  await page.waitForFunction(() => /live task stage\(s\) completed/.test(document.querySelector('#promptStatus').textContent), null, { timeout: 30000 });

  const stages = requests.map(request => {
    if (request.provider === 'anthropic') return request.body.system;
    if (request.provider === 'google') return request.body.systemInstruction.parts[0].text;
    return request.body.input[0].content;
  });
  const prompts = requests.map(request => {
    if (request.provider === 'anthropic') return request.body.messages[0].content;
    if (request.provider === 'google') return request.body.contents[0].parts[0].text;
    return request.body.input[1].content;
  });
  const log = await page.locator('#log').innerText();
  ok('one provider powers all nine ordered role stages', requests.length === 9 && /FIRST CHECK/.test(stages[0]) && /SECOND CHECK/.test(stages[1]) && /COLLECTIVE CHECK/.test(stages[2]) && /PLATFORM CHECK/.test(stages[7]) && /TEAM LEAD/.test(stages[8]), JSON.stringify(stages.map(s => s.match(/(?:FIRST CHECK|SECOND CHECK|COLLECTIVE CHECK|BUILDER|INTEGRATION REVIEW|SOURCE CHECK|STRATEGY REVIEW|PLATFORM CHECK|TEAM LEAD)/)?.[0])));
  const reviewedHandoff = /review the incoming handoff before your own work/i.test(stages[0]) && /review the incoming handoff before your own work/i.test(stages[1]) &&
    prompts[0].includes('REVIEW THIS FIRST') && prompts[1].includes('HANDOFF FROM Gemini') && prompts[2].includes('HANDOFF FROM Muse');
  ok('each incoming handoff is explicitly reviewed before assigned work', reviewedHandoff, JSON.stringify({ system: stages.slice(0, 2), prior: prompts.slice(1, 3) }));
  ok('Grok Bot receives and reviews the full prior chain', prompts[8].includes('HANDOFF FROM Gemini') && prompts[8].includes('HANDOFF FROM Xcode') && /FINAL SITUATION REPORT/.test(prompts[8]));
  ok('all nine role messages use the selected model',
    requests.length === 9 && requests.every(request => request.provider === 'openai') &&
    (log.match(/FAKE HANDOFF RESPONSE \d+/g) || []).length === 9 &&
    /live · OpenAI · gpt-4o-mini/i.test(log));
  ok('model tasks do not claim repository or tool changes', /text-only/i.test(log) && /did not edit files or execute tools/i.test(log));
  ok('no real provider traffic or browser errors', errors.length === 0, JSON.stringify(errors));
} finally {
  await browser.close();
}

console.log(failed ? `FAILED ${failed} check(s)` : 'ALL HANDOFF CHECKS PASSED');
if (failed) process.exit(1);
