import { createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const pw = require('playwright');
const PAGE = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href + '?autoplay=0';
const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await pw.chromium.launch(launchOpts);
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });

let failed = 0;
const ok = (name, pass, detail = '') => {
  if (!pass) failed++;
  console.log((pass ? 'PASS ' : 'FAIL ') + name, detail);
};

await page.goto(PAGE);
const idleActivity = await page.evaluate(() => {
  const brain = document.querySelector('#brain');
  const halo = getComputedStyle(brain, '::after');
  return {
    hubVisible: brain.getClientRects().length > 0 && getComputedStyle(brain).pointerEvents !== 'none',
    halo: halo.borderStyle === 'solid' && halo.inset === '-17px' && halo.boxShadow !== 'none',
    noLivePulse: !brain.classList.contains('model-active') &&
      document.querySelectorAll('.node.model-active, #hand path, #hand circle').length === 0
  };
});
ok('the brain starts with a visible anchored halo and no simulated firing',
  idleActivity.hubVisible && idleActivity.halo && idleActivity.noLivePulse, JSON.stringify(idleActivity));

const initial = await page.locator('#brainObject').evaluate(canvas => {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let visible = 0, fingerprint = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] > 0) visible++;
    fingerprint = (Math.imul(fingerprint, 31) + pixels[i] + pixels[i + 1] + pixels[i + 2] + pixels[i + 3]) >>> 0;
  }
  const buffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  return { width: canvas.width, height: canvas.height, visible, fingerprint, bufferBytes: buffer ? gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE) : 0 };
});
ok('generated WebGL mesh is visible', initial.width > 0 && initial.height > 0 && initial.visible > 100, JSON.stringify(initial));
ok('brain is a vertex mesh, not an embedded picture', initial.bufferBytes > 10000 && await page.locator('#brainMesh img').count() === 0);

const stage = await page.locator('#stage').boundingBox();
await page.mouse.move(stage.x + 12, stage.y + 12);
await page.mouse.down();
await page.waitForTimeout(40);
const orbitFilter = await page.locator('#brainObject').evaluate(el => getComputedStyle(el).filter);
const blurPx = Number(orbitFilter.match(/blur\(([\d.]+)px\)/)?.[1]);
ok('orbit gesture applies only a slight blur while moving',
  await page.locator('#stage').evaluate(el => el.classList.contains('orbiting')) &&
  Number.isFinite(blurPx) && blurPx > 0 && blurPx <= 0.65,
  orbitFilter);
await page.mouse.move(stage.x + 110, stage.y + 62, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(80);
const rotated = await page.locator('#brainObject').evaluate(canvas => {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let fingerprint = 0;
  for (let i = 0; i < pixels.length; i += 4) fingerprint = (Math.imul(fingerprint, 31) + pixels[i] + pixels[i + 1] + pixels[i + 2] + pixels[i + 3]) >>> 0;
  return fingerprint;
});
ok('orbit rotates the 3D vertex mesh', initial.fingerprint !== rotated);
for (let turn = 0; turn < 3; turn++) {
  await page.mouse.move(stage.x + 10, stage.y + 20);
  await page.mouse.down();
  await page.mouse.move(stage.x + stage.width - 10, stage.y + 20, { steps: 12 });
  await page.mouse.up();
}
const spin = Number((await page.locator('#coords').innerText()).match(/spin (-?\d+)°/i)?.[1]);
ok('orbit is not locked and supports more than 720 degrees', spin > 720, String(spin));

await page.locator('#stage').evaluate(el => {
  for (let i = 0; i < 30; i++) el.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }));
});
ok('wheel zoom reaches the 450% upper range with motion blur', /zoom 450%/i.test(await page.locator('#coords').innerText()) &&
  await page.locator('#stage').evaluate(el => el.classList.contains('zooming')));
await page.locator('#stage').evaluate(el => {
  for (let i = 0; i < 180; i++) el.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }));
});
ok('wheel zoom reaches the 25% lower range', /zoom 25%/i.test(await page.locator('#coords').innerText()));
await page.waitForTimeout(180);
ok('motion blur clears after movement stops', !await page.locator('#stage').evaluate(el => el.classList.contains('zooming')));
await page.click('#resetView');
const brainBeforeDrag = await page.locator('#brain').boundingBox();
await page.mouse.move(brainBeforeDrag.x + brainBeforeDrag.width / 2, brainBeforeDrag.y + brainBeforeDrag.height / 2);
await page.mouse.down();
await page.mouse.move(brainBeforeDrag.x + brainBeforeDrag.width / 2 + 70, brainBeforeDrag.y + brainBeforeDrag.height / 2 + 42, { steps: 6 });
await page.mouse.up();
const brainAfterDrag = await page.locator('#brain').boundingBox();
const movedWithHalo = await page.locator('#brain').evaluate(brain => {
  const halo = getComputedStyle(brain, '::after');
  return halo.borderStyle === 'solid' && halo.inset === '-17px' && !brain.classList.contains('model-active');
});
ok('dragging the brain moves its halo with the hub without a false model pulse',
  movedWithHalo && Math.abs(brainAfterDrag.x - brainBeforeDrag.x) > 40 && Math.abs(brainAfterDrag.y - brainBeforeDrag.y) > 20,
  JSON.stringify({ before: brainBeforeDrag, after: brainAfterDrag, movedWithHalo }));
await page.click('#center');

await page.setViewportSize({ width: 400, height: 850 });
await page.waitForTimeout(80);
const mobile = await page.locator('#brainObject').evaluate(canvas => {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let visible = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) visible++;
  return { width: canvas.width, height: canvas.height, visible };
});
ok('mesh remains visible at phone width', mobile.width > 0 && mobile.height > 0 && mobile.visible > 100, JSON.stringify(mobile));

await page.emulateMedia({ colorScheme: 'light' });
await page.waitForTimeout(30);
await page.emulateMedia({ colorScheme: 'dark' });
const darkVisible = await page.locator('#brainObject').evaluate(canvas => {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let visible = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) visible++;
  return visible;
});
ok('mesh remains visible in light and dark appearance settings', darkVisible > 100, String(darkVisible));

await page.evaluate(() => {
  const entry = (id, key, type, title, links) => ({ id, key, type, title, note: 'Test memory', sources: [{ kind: 'file', label: 'Test note', ref: null }], strength: 1, status: 'fresh', created: Date.now(), seen: Date.now(), links, corrected: false, skill: false, prog: null, corpusId: null, kws: null, manual: true });
  localStorage.setItem('brain.mem.v2', JSON.stringify({
    version: 2,
    entries: [
      entry('e1', 'm:concept:design', 'concept', 'Design cue', ['e2']),
      entry('e2', 'm:entity:anatomy', 'entity', 'Anatomy source', ['e1'])
    ],
    sessions: [], blocked: [], inbox: [], runs: 0, dayShift: 0, nextId: 3, nextSession: 1, filtered: 0,
    settings: { brain: true, sources: true, docs: true, msgs: false, tracker: true, instructions: '' }
  }));
});
await page.reload();
await page.waitForTimeout(80);
const graphMemory = await page.locator('#gNodes .gn').evaluateAll(nodes => nodes.map(node => ({
  label: node.querySelector('.lbl').textContent,
  aria: node.getAttribute('aria-label'),
  color: getComputedStyle(node.querySelector('.dot')).stroke
})));
const graphLinks = await page.locator('#gEdges .glinks').getAttribute('d');
ok('each memory has a visible title and category label', graphMemory.length === 2 && graphMemory.some(node => node.label === 'Design cue' && /Concept/.test(node.aria)) && graphMemory.some(node => node.label === 'Anatomy source' && /Entity/.test(node.aria)), JSON.stringify(graphMemory));
ok('memory categories have distinct colors', new Set(graphMemory.map(node => node.color)).size === 2, JSON.stringify(graphMemory.map(node => node.color)));
ok('related memories render as a connected web', graphLinks && graphLinks.length > 0, graphLinks || '');
await page.locator('#gNodes .gn[aria-label^="Design cue"]').click();
const focusText = await page.locator('#memoryFocus').innerText();
const focusChecks = {
  visible: await page.locator('#memoryFocus').isVisible(),
  title: /Design cue/i.test(focusText),
  note: /Test memory/i.test(focusText),
  source: /file: Test note/i.test(focusText),
  related: /Anatomy source/i.test(focusText),
  zoom: /zoom 210%/i.test(await page.locator('#coords').innerText())
};
ok('focused memory zooms to the dot and expands its specifics', await page.locator('#memoryFocus').isVisible() &&
  Object.values(focusChecks).every(Boolean), JSON.stringify({ focusChecks, focusText, coords: await page.locator('#coords').innerText() }));
ok('focus zoom keeps the selected memory centered',
  await page.locator('#world').evaluate(el => /^translate\(/.test(el.style.transform)));

ok('render reports no browser errors', errors.length === 0, JSON.stringify(errors));

await browser.close();
console.log(failed ? `FAILED ${failed} check(s)` : 'ALL MESH CHECKS PASSED');
if (failed) process.exit(1);
