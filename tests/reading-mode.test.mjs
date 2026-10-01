import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { defaultReadingMode, readingModes } from '../src/model/services/bookExperience.ts';
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

async function renderMode(reducedMotion) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = () => ({ matches: reducedMotion });
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
    close: async () => {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}

test('o hook escolhe o modo inicial pela preferência de movimento e permite trocar', async () => {
  const calm = await renderMode(true);
  assert.equal(calm.vm.mode, 'normal');
  assert.equal(calm.vm.isBook, false);
  await act(async () => calm.vm.setMode('livro'));
  assert.equal(calm.vm.mode, 'livro');
  assert.equal(calm.vm.isBook, true);
  await calm.close();

  const regular = await renderMode(false);
  assert.equal(regular.vm.mode, 'livro');
  await act(async () => regular.vm.setMode('normal'));
  assert.equal(regular.vm.mode, 'normal');
  // A escolha não é gravada no navegador (a Política de Privacidade diz isso).
  assert.equal(window.localStorage.length, 0);
  assert.equal(window.sessionStorage.length, 0);
  await regular.close();
});
