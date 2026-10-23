// Current page smoke checks: live-only prompts, memory controls, privacy, and responsive layout.
// Run: npm install --no-save playwright && node tests/brain-check.mjs
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
const ctx = await browser.newContext({ viewport: { width: 1280, height: 950 }, colorScheme: 'dark' });
const page = await ctx.newPage();
page.on('pageerror', error => errors.push('PAGEERR ' + error.message));
page.on('console', message => {
  if (message.type() === 'error' && !/Failed to load resource|net::ERR/.test(message.text())) errors.push(message.text());
});
await page.goto(PAGE);
await page.evaluate(() => window.__brainTest.setSpeed(0));

ok('starts with empty personal memory and Live AI off',
  /0 entries/i.test(await page.locator('#memCount').innerText()) &&
  /live ai off/i.test(await page.locator('#modeBadge').innerText()));
ok('the page clearly says live calls are off without calling itself a simulation',
  /Live AI off/i.test(await page.locator('body').innerText()) &&
  !/simulation/i.test(await page.locator('body').innerText()));
ok('no built-in facts or fake task-entry controls',
  /No prompt has been sent/i.test(await page.locator('#log').innerText()) &&
  await page.locator('#speed, #dispatch, .dispatchline, #dispatchText, #dispatchGo, #dispatchLine, #dispatchCopy, #samples, #playBtn, #nextBtn').count() === 0);
ok('no prompt is sent automatically', await page.locator('#promptText').inputValue() === '');

ok('hive view is the default stage', await page.locator('#stage').getAttribute('data-mode') === 'graph');
await page.click('#modeTeam');
ok('team network contains nine agents', await page.locator('.node').count() === 9);
await page.click('#tab-team');
ok('team tab explains all nine specialties', await page.locator('#teamList .entry').count() === 9 &&
  /Specialty:/.test(await page.locator('#teamList').innerText()));
await page.focus('#tab-team');
await page.keyboard.press('ArrowRight');
ok('keyboard navigation moves between tabs', await page.locator('#tab-mem').getAttribute('aria-selected') === 'true');

await page.click('#tab-mem');
await page.click('#runNow');
await page.waitForFunction(() => document.querySelector('#runBadge').textContent === 'runs: 1');
ok('Brain run reports honestly when there is nothing new',
  /Nothing new to learn/i.test(await page.locator('#runReport').innerText()));

await page.selectOption('#aType', 'concept');
await page.fill('#aTitle', 'Design principle');
await page.fill('#aNote', 'Keep the memory graph clear and connected.');
await page.click('#addForm button[type=submit]');
await page.waitForFunction(() => document.querySelector('#runBadge').textContent === 'runs: 2');
const firstCard = page.locator('.entry').filter({ has: page.locator('.ttl', { hasText: /^Design principle$/ }) });
ok('a note can be added and learned', await firstCard.count() === 1 &&
  /1 from files or notes/i.test(await page.locator('#runReport').innerText()));
ok('memory categories use their own colors', await firstCard.evaluate(el => getComputedStyle(el).getPropertyValue('--k').trim()) !== '');
await page.click('#modeGraph');
await page.locator('#gNodes .gn[aria-label^="Design principle"]').click();
const focusDetails = await page.locator('#memoryFocus').innerText();
const focusCoords = await page.locator('#coords').innerText();
const focusTransform = await page.locator('#world').evaluate(el => el.style.transform);
const focusChecks = {
  visible: await page.locator('#memoryFocus').isVisible(),
  title: /Design principle/i.test(focusDetails),
  note: /Keep the memory graph clear and connected/i.test(focusDetails),
  source: /file:/i.test(focusDetails),
  noNullText: !/\bnull\b/i.test(focusDetails),
  zoom: /zoom 210%/i.test(focusCoords),
  centered: /translate\(/.test(focusTransform)
};
ok('selecting a memory zooms to it and expands the specifics',
  Object.values(focusChecks).every(Boolean),
  JSON.stringify({ focusChecks, focusDetails, focusCoords, focusTransform }));
await page.locator('#memoryFocus').getByRole('button', { name: 'Open full entry' }).click();
ok('expanded memory details link to the full editable entry', await firstCard.isVisible());

await firstCard.getByRole('button', { name: 'Correct' }).click();
await page.locator('.entry input[type=text]').first().fill('Keep the labeled memory web easy to scan.');
await page.getByRole('button', { name: 'Save correction' }).click();
ok('a memory correction is saved', /labeled memory web/i.test(await firstCard.innerText()));

await page.fill('#aTitle', 'Filtered note');
await page.fill('#aNote', 'my password is hunter2 and api_key=sk-abcdefghijklmnop');
await page.click('#addForm button[type=submit]');
ok('secret-like text is filtered and disclosed',
  /password or key/i.test(await page.locator('#addWarn').innerText()) &&
  !/hunter2|sk-abcdef/.test(await page.evaluate(() => localStorage.getItem('brain.mem.v2'))));

await page.locator('summary', { hasText: 'Backup and restore' }).click();
await page.click('#bExport');
const backup = await page.inputValue('#backup');
ok('memory backup is valid JSON', backup.startsWith('{') && JSON.parse(backup).entries.length >= 2);
await page.fill('#aTitle', 'Temporary note');
await page.fill('#aNote', 'This entry should not survive restoring the backup.');
await page.click('#addForm button[type=submit]');
await page.waitForFunction(() => document.querySelector('#runBadge').textContent === 'runs: 3');
await page.fill('#backup', backup);
await page.click('#bLoad');
await page.click('#bLoad');
ok('restore replaces the current memory', await page.locator('.entry .ttl', { hasText: /^Temporary note$/ }).count() === 0 &&
  await page.locator('.entry .ttl', { hasText: /^Design principle$/ }).count() === 1);

await page.fill('#backup', JSON.stringify({ entries: [{
  id: 'e900', key: 'manual:hostile', type: 'concept', title: '<img src=x onerror=alert(1)>',
  note: 'Plain text only.', sources: [], links: [], strength: 1, seen: 1, created: 1, status: 'fresh'
}] }));
await page.click('#bLoad');
await page.click('#bLoad');
ok('restored titles remain text, not executable markup',
  await page.locator('.entry .ttl', { hasText: '<img src=x onerror=alert(1)>' }).count() === 1 &&
  await page.locator('.entry img').count() === 0);
await page.reload();
ok('memory persists after reload', await page.locator('.entry .ttl', { hasText: '<img src=x onerror=alert(1)>' }).count() === 1);
await ctx.close();

for (const colorScheme of ['light', 'dark']) {
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme });
  const mobile = await mobileCtx.newPage();
  mobile.on('pageerror', error => errors.push('PAGEERR ' + error.message));
  await mobile.goto(PAGE);
  await mobile.click('#modeGraph');
  await mobile.click('#tab-mem');
  const mobileOk = await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  ok('phone layout fits without horizontal scrolling (' + colorScheme + ')', mobileOk);
  await mobileCtx.close();
}

console.log('ERRORS', JSON.stringify(errors));
console.log(failed || errors.length ? (failed + ' CHECK(S) FAILED') : 'ALL BRAIN CHECKS PASSED');
await browser.close();
if (failed || errors.length) process.exitCode = 1;
