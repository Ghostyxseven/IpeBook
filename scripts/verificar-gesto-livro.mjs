/** Verificação real via Chrome DevTools Protocol, sem Playwright ou dependências. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.IPEBOOK_TEST_URL || 'http://127.0.0.1:8089';
const debug = process.env.IPEBOOK_CDP_URL || 'http://127.0.0.1:9333';
const output = process.env.IPEBOOK_SCREENSHOTS || '/tmp/ipebook-gesto';
await mkdir(output, { recursive: true });
const tabs = await (await fetch(`${debug}/json/list`)).json();
const socket = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const runtimeErrors = [];
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown')
    runtimeErrors.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const entry = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
  else entry.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id;
    pending.set(key, { resolve, reject });
    socket.send(JSON.stringify({ id: key, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function screenshot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`${output}/${name}.png`, Buffer.from(data, 'base64'));
}
async function page(hash = '') {
  await send('Page.navigate', { url: `${base}/${hash}` });
  for (let n = 0; n < 100; n++) {
    if (await evaluate('!!document.querySelector(".book-stage")')) break;
    await wait(50);
  }
  for (let n = 0; n < 50; n++) {
    if (await evaluate('!document.querySelector(".book-strip")')) break;
    await wait(50);
  }
  await wait(200);
}
async function touch(type, x = 0, y = 500) {
  await send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }],
  });
}
async function move(from, to, y = 500) {
  await touch('touchStart', from, y);
  for (let i = 1; i <= 8; i++) {
    await touch('touchMove', from + ((to - from) * i) / 8, y);
    await wait(20);
  }
}
async function state() {
  return evaluate(
    '({hash:location.hash, strips:document.querySelectorAll(".book-strip").length, transform:document.querySelector(".book-strip:last-child")?.style.transform, current:document.querySelector(".book-page.is-current")?.getAttribute("aria-label"), overflow:document.documentElement.scrollWidth>innerWidth})',
  );
}
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  await page();
  await screenshot('celular-inicio');

  await move(345, 235);
  const partial = await state();
  assert.equal(partial.strips, 12, 'a folha deve aparecer antes de soltar');
  assert.equal(partial.hash, '');
  await screenshot('celular-arrasto');
  await touch('touchMove', 95);
  await wait(40);
  assert.notEqual((await state()).transform, partial.transform);
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#sobre');
  assert.equal((await state()).strips, 0);
  await screenshot('celular-sobre');
  await move(50, 295);
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#inicio', 'voltar');
  await move(345, 300);
  await wait(120);
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#inicio', 'gesto curto retorna');
  await move(345, 100);
  await touch('touchCancel');
  await wait(400);
  assert.equal((await state()).hash, '#inicio', 'cancelamento retorna');
  await move(345, 140);
  await touch('touchMove', 330);
  await wait(120);
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#inicio', 'reversão retorna');
  await move(345, 170);
  await touch('touchEnd');
  await wait(35);
  await evaluate(
    `document.querySelector('.book-stage').addEventListener('pointerdown', () => { window.resumedTransform = document.querySelector('.book-strip:last-child')?.style.transform; }, {once:true, capture:true})`,
  );
  await touch('touchStart', 40);
  await wait(60);
  assert.equal(
    (await state()).transform,
    await evaluate('window.resumedTransform'),
    'retomar mantém posição',
  );
  await touch('touchMove', 370);
  await wait(120);
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#inicio', 'retomada permite cancelar');
  await move(45, 300);
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#inicio', 'limite inicial');
  await page();
  const buttonPoint = await evaluate(
    `(() => { const r = document.querySelector('.reader-actions button').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`,
  );
  await move(buttonPoint.x, buttonPoint.x - 80, buttonPoint.y);
  assert.equal((await state()).strips, 0, 'controles não iniciam virada');
  await touch('touchCancel');
  await page('#informacoes');
  await move(340, 80);
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#informacoes', 'limite final');
  await page('#duvidas');
  const faqPoint = await evaluate(
    `(() => { const el = document.querySelector('.book-page.is-current summary'); el.scrollIntoView({block:'center',behavior:'instant'}); const r = el.getBoundingClientRect(); return {x:r.x+r.width*0.8,y:r.y+r.height/2}; })()`,
  );
  await move(faqPoint.x, faqPoint.x - 180, faqPoint.y);
  assert.equal((await state()).strips, 12, 'FAQ acompanha o arrasto');
  assert.equal(
    await evaluate(`document.querySelector('.book-page.is-current details').open`),
    false,
  );
  await touch('touchEnd');
  await wait(400);
  assert.equal((await state()).hash, '#proximo-capitulo', 'FAQ permite passar página');
  await page('#duvidas');
  const tapPoint = await evaluate(
    `(() => { const el = document.querySelector('.book-page.is-current summary'); el.scrollIntoView({block:'center',behavior:'instant'}); const r = el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`,
  );
  await touch('touchStart', tapPoint.x, tapPoint.y);
  await wait(50);
  await touch('touchEnd');
  await wait(350);
  assert.equal(
    await evaluate(`document.querySelector('.book-page.is-current details').open`),
    true,
    'toque abre resposta',
  );
  await touch('touchStart', tapPoint.x, tapPoint.y);
  await wait(50);
  await touch('touchEnd');
  await wait(350);
  assert.equal(
    await evaluate(`document.querySelector('.book-page.is-current details').open`),
    false,
    'toque fecha resposta',
  );
  await page('#duvidas');
  const scrollBefore = await evaluate('document.querySelector(".book-page.is-current").scrollTop');
  await touch('touchStart', 350, 650);
  for (let y = 620; y >= 300; y -= 40) {
    await touch('touchMove', 350, y);
    await wait(20);
  }
  await touch('touchEnd');
  await wait(150);
  assert.equal((await state()).hash, '#duvidas');
  const scrollAfter = await evaluate('document.querySelector(".book-page.is-current").scrollTop');
  assert.ok(scrollAfter > scrollBefore, 'rolagem vertical preservada');
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await page();
  await move(345, 80);
  assert.equal((await state()).strips, 0);
  await touch('touchEnd');
  await wait(100);
  assert.equal((await state()).hash, '#sobre');
  await send('Emulation.setEmulatedMedia', { features: [] });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page();
  await evaluate('document.querySelector(".book-turn:last-child").click()');
  await wait(400);
  assert.equal((await state()).hash, '#sobre');
  assert.equal((await state()).overflow, false);
  await screenshot('desktop-sobre');
  await evaluate(`document.querySelector('.book-presentation').focus()`);
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'ArrowRight',
    code: 'ArrowRight',
    windowsVirtualKeyCode: 39,
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'ArrowRight',
    code: 'ArrowRight',
    windowsVirtualKeyCode: 39,
  });
  await wait(40);
  assert.equal((await state()).hash, '#como-funciona');
  assert.equal((await state()).strips, 0, 'teclado sem animação');
  assert.deepEqual(runtimeErrors, [], 'sem erros JavaScript');
  console.log(
    'OK: arrasto real parcial, conclusão, retorno, curto, cancelamento, reversão, retomada, limites, rolagem vertical, movimento reduzido e desktop. Capturas: ' +
      output,
  );
} finally {
  socket.close();
}
