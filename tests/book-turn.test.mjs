import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createBookTurn } from '../src/view/animations/bookTurn.ts';

function setup(initial = 0, reduced = false) {
  const dom = new JSDOM(
    '<div id="stage"><div class="book-page"><p id="text">Capa</p><button>Botão</button><details><summary>Pergunta</summary>Resposta</details></div><div class="book-page">Sobre</div><div class="book-page">Contato</div></div><div id="layer" inert aria-hidden="true"></div>',
  );
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.getComputedStyle = () => ({
    getPropertyValue: (name) => (name.endsWith('duration') ? '250ms' : 'linear'),
  });
  let callback;
  globalThis.requestAnimationFrame = (cb) => {
    callback = cb;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {
    callback = null;
  };
  const stage = document.getElementById('stage');
  const layer = document.getElementById('layer');
  Object.defineProperties(stage, { clientWidth: { value: 400 }, clientHeight: { value: 700 } });
  let captured = false;
  stage.setPointerCapture = () => {
    captured = true;
  };
  stage.hasPointerCapture = () => captured;
  stage.releasePointerCapture = () => {
    captured = false;
  };
  let animation;
  layer.animate = () => {
    animation = {
      progress: 0,
      playState: 'running',
      effect: { getComputedTiming: () => ({ progress: animation.progress }) },
      cancel() {
        this.playState = 'idle';
      },
    };
    return animation;
  };
  let index = initial;
  const navigations = [];
  const controller = createBookTurn(stage, layer, {
    index: () => index,
    reduced: () => reduced,
    navigate: (next) => {
      navigations.push(next);
      const old = index;
      index = next;
      controller.sync(old, next, false);
    },
    onGesture() {},
  });
  let time = 0;
  function pointer(type, x, y = 100, target = stage, extra = {}) {
    time += 150;
    const event = new dom.window.Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, {
      pointerId: 1,
      isPrimary: true,
      button: 0,
      clientX: x,
      clientY: y,
      ...extra,
    });
    Object.defineProperty(event, 'timeStamp', { value: time });
    target.dispatchEvent(event);
  }
  function tick(progress = 1) {
    if (!animation || !callback) return;
    animation.progress = progress;
    animation.playState = progress === 1 ? 'finished' : 'running';
    const cb = callback;
    callback = null;
    cb();
  }
  return {
    stage,
    layer,
    pointer,
    tick,
    navigations,
    close() {
      controller.destroy();
      dom.window.close();
    },
  };
}

test('folha acompanha antes de soltar; confirma uma única navegação e limpa clones', () => {
  const s = setup();
  s.pointer('pointerdown', 360);
  s.pointer('pointermove', 290);
  assert.equal(s.layer.children.length, 12);
  s.pointer('lostpointercapture', 290, 100, s.stage.querySelector('p'));
  assert.equal(s.layer.children.length, 12, 'transferência da captura do filho não cancela');
  assert.equal(s.layer.querySelectorAll('[id]').length, 0);
  const first = s.layer.lastElementChild.style.transform;
  s.pointer('pointermove', 130);
  assert.notEqual(s.layer.lastElementChild.style.transform, first);
  assert.deepEqual(s.navigations, []);
  s.pointer('pointerup', 130);
  s.tick();
  assert.deepEqual(s.navigations, [1]);
  assert.equal(s.layer.children.length, 0);
  s.close();
});
test('gesto curto, reversão e cancelamento preservam capítulo', () => {
  for (const mode of ['curto', 'reversao', 'cancelamento']) {
    const s = setup();
    s.pointer('pointerdown', 360);
    s.pointer('pointermove', mode === 'curto' ? 330 : 100);
    if (mode === 'reversao') s.pointer('pointermove', 350);
    s.pointer(
      mode === 'cancelamento' ? 'pointercancel' : 'pointerup',
      mode === 'curto' ? 330 : 350,
    );
    s.tick();
    assert.deepEqual(s.navigations, [], mode);
    assert.equal(s.layer.children.length, 0);
    s.close();
  }
});
test('voltar, limites e movimento reduzido', () => {
  for (const reduced of [false, true]) {
    const s = setup(1, reduced);
    s.pointer('pointerdown', 40);
    s.pointer('pointermove', 280);
    if (reduced) assert.equal(s.layer.children.length, 0);
    s.pointer('pointerup', 280);
    s.tick();
    assert.deepEqual(s.navigations, [0]);
    s.pointer('pointerdown', 40);
    s.pointer('pointermove', 280);
    s.pointer('pointerup', 280);
    assert.deepEqual(s.navigations, [0]);
    s.close();
  }
});
test('rolagem vertical, botão e segundo dedo não iniciam virada', () => {
  const s = setup();
  s.pointer('pointerdown', 350);
  s.pointer('pointermove', 340, 300);
  s.pointer('pointerup', 340, 300);
  s.pointer('pointerdown', 350, 100, s.stage.querySelector('button'));
  s.pointer('pointermove', 100);
  s.pointer('pointerup', 100);
  s.pointer('pointerdown', 350, 100, s.stage, { isPrimary: false, pointerId: 2 });
  s.pointer('pointermove', 100, 100, s.stage, { pointerId: 2 });
  assert.equal(s.layer.children.length, 0);
  assert.deepEqual(s.navigations, []);
  s.close();
});
test('retomar finalização preserva a posição e permite retornar', () => {
  const s = setup();
  s.pointer('pointerdown', 360);
  s.pointer('pointermove', 180);
  s.pointer('pointerup', 180);
  s.tick(0.3);
  const before = s.layer.lastElementChild.style.transform;
  s.pointer('pointerdown', 30);
  assert.equal(s.layer.lastElementChild.style.transform, before);
  s.pointer('pointermove', 380);
  s.pointer('pointerup', 380);
  s.tick();
  assert.deepEqual(s.navigations, []);
  assert.equal(s.layer.children.length, 0);
  s.close();
});
test('redimensionar cancela sem navegar e limpa camada visual', () => {
  const s = setup();
  s.pointer('pointerdown', 350);
  s.pointer('pointermove', 120);
  window.dispatchEvent(new window.Event('resize'));
  s.pointer('pointerup', 120);
  s.tick();
  assert.equal(s.layer.children.length, 0);
  assert.deepEqual(s.navigations, []);
  s.close();
});

test('um botão continua clicável após um gesto sem clique sintetizado', () => {
  const s = setup();
  s.pointer('pointerdown', 350);
  s.pointer('pointermove', 320);
  s.pointer('pointerup', 320);
  s.tick();
  const button = s.stage.querySelector('button');
  s.pointer('pointerdown', 350, 100, button);
  const click = new window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
  assert.equal(button.dispatchEvent(click), true);
  s.close();
});

test('pergunta do FAQ permite arrastar e preserva toque simples', () => {
  const s = setup();
  const summary = s.stage.querySelector('summary');
  s.pointer('pointerdown', 350, 100, summary);
  s.pointer('pointerup', 350, 100, summary);
  const tap = new window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
  assert.equal(summary.dispatchEvent(tap), true, 'toque simples não é bloqueado');
  s.pointer('pointerdown', 350, 100, summary);
  s.pointer('pointermove', 120, 100, summary);
  assert.equal(s.layer.children.length, 12, 'arrasto no FAQ acompanha o dedo');
  s.pointer('pointerup', 120, 100, summary);
  const click = new window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
  assert.equal(summary.dispatchEvent(click), false, 'arrasto não abre a resposta');
  s.tick();
  assert.deepEqual(s.navigations, [1]);
  s.close();
});
