import test from 'node:test';
import { readFile } from 'node:fs/promises';
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
import { createReadingModeRepository } from '../src/model/repositories/readingModeRepository.ts';
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

/** Armazenamento em memória que imita a parte usada do Storage. */
function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => void data.set(key, String(value)),
    get length() {
      return data.size;
    },
  };
}

async function renderMode(reducedMotion, storage = memoryStorage()) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const repository = createReadingModeRepository(storage);
  let vm;
  function Probe() {
    vm = useReadingMode(repository, { prefersReducedMotion: reducedMotion });
    return null;
  }
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return vm;
    },
    storage,
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
  const storage = memoryStorage();
  const first = await renderMode(false, storage);
  await act(async () => first.vm.setMode('normal'));
  assert.equal(first.vm.mode, 'normal');
  assert.equal(first.vm.isBook, false);
  assert.equal(storage.getItem(readingModeStorageKey), 'normal');
  assert.equal(storage.length, 1);
  await first.close();

  const returning = await renderMode(false, storage);
  assert.equal(returning.vm.mode, 'normal');
  await returning.close();
  const override = await renderMode(true, memoryStorage({ [readingModeStorageKey]: 'livro' }));
  assert.equal(override.vm.mode, 'livro');
  await override.close();
});

test('valores desconhecidos guardados no navegador são ignorados', async () => {
  assert.equal(parseReadingMode('livro'), 'livro');
  assert.equal(parseReadingMode('normal'), 'normal');
  for (const value of ['', 'Livro', '3d', null, undefined, 1, {}]) {
    assert.equal(parseReadingMode(value), null);
  }
  const broken = await renderMode(
    false,
    memoryStorage({ [readingModeStorageKey]: 'qualquer-coisa' }),
  );
  assert.equal(broken.vm.mode, 'livro');
  await broken.close();
});

test('sem armazenamento disponível a escolha vale só nesta visita', async () => {
  const blocked = {
    getItem() {
      throw new Error('bloqueado');
    },
    setItem() {
      throw new Error('bloqueado');
    },
  };
  for (const storage of [blocked, null]) {
    const view = await renderMode(false, storage);
    assert.equal(view.vm.mode, 'livro');
    await act(async () => view.vm.setMode('normal'));
    assert.equal(view.vm.mode, 'normal');
    await view.close();
  }
});

test('a ViewModel não acessa o armazenamento do navegador direto', async () => {
  const source = await readFile(
    new URL('../src/viewmodel/useReadingMode.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});
