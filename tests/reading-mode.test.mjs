import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  defaultReadingMode,
  parseReadingMode,
  readingModes,
  readingModeStorageKey,
} from '../src/model/services/bookExperience.ts';
import { useReadingMode } from '../src/viewmodel/useReadingMode.ts';

test('quem pede menos movimento começa na leitura normal; os demais, no livro', () => {
  assert.equal(defaultReadingMode(true), 'normal');
  assert.equal(defaultReadingMode(false), 'livro');
  assert.deepEqual(
    readingModes.map((mode) => mode.id),
    ['livro', 'normal'],
  );
  for (const mode of readingModes) assert.ok(mode.label && mode.description);
});

async function renderMode(reducedMotion, stored) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = () => ({ matches: reducedMotion });
  if (stored !== undefined) dom.window.localStorage.setItem(readingModeStorageKey, stored);
  let vm;
  function Probe() {
    vm = useReadingMode();
    return null;
  }
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return vm;
    },
    storage: dom.window.localStorage,
    close: async () => {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}

test('sem escolha anterior, o modo vem do movimento reduzido e nada é gravado ao abrir', async () => {
  const calm = await renderMode(true);
  assert.equal(calm.vm.mode, 'normal');
  assert.equal(calm.storage.length, 0);
  await calm.close();
  const regular = await renderMode(false);
  assert.equal(regular.vm.mode, 'livro');
  assert.equal(regular.storage.length, 0);
  await regular.close();
});

test('a escolha do visitante é gravada e vale mais que a preferência do sistema', async () => {
  const first = await renderMode(false);
  await act(async () => first.vm.setMode('normal'));
  assert.equal(first.vm.mode, 'normal');
  assert.equal(first.vm.isBook, false);
  assert.equal(first.storage.getItem(readingModeStorageKey), 'normal');
  assert.equal(first.storage.length, 1);
  assert.equal(window.sessionStorage.length, 0);
  await first.close();

  const returning = await renderMode(false, 'normal');
  assert.equal(returning.vm.mode, 'normal');
  await returning.close();
  const override = await renderMode(true, 'livro');
  assert.equal(override.vm.mode, 'livro');
  await override.close();
});

test('valores desconhecidos guardados no navegador são ignorados', async () => {
  assert.equal(parseReadingMode('livro'), 'livro');
  assert.equal(parseReadingMode('normal'), 'normal');
  for (const value of ['', 'Livro', '3d', null, undefined, 1, {}]) {
    assert.equal(parseReadingMode(value), null);
  }
  const broken = await renderMode(false, 'qualquer-coisa');
  assert.equal(broken.vm.mode, 'livro');
  await broken.close();
});

test('sem armazenamento disponível a escolha vale só nesta visita', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = () => ({ matches: false });
  Object.defineProperty(dom.window, 'localStorage', {
    get() {
      throw new Error('bloqueado');
    },
  });
  let vm;
  function Probe() {
    vm = useReadingMode();
    return null;
  }
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  assert.equal(vm.mode, 'livro');
  await act(async () => vm.setMode('normal'));
  assert.equal(vm.mode, 'normal');
  await act(async () => root.unmount());
  dom.window.close();
});
