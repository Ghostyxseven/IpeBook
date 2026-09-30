import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useBookExperience } from '../src/viewmodel/useBookExperience.ts';

test('guia, busca vazia, recuperação e detalhes respeitam a navegação', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let vm;
  function Probe() {
    vm = useBookExperience();
    return null;
  }
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  await act(async () => vm.openGuide('vender'));
  assert.equal(vm.guide.id, 'vender');
  assert.equal(window.location.hash, '#como-funciona');
  await act(async () => vm.setFilter('Doação'));
  assert.equal(vm.examples.length, 1);
  assert.equal(vm.examples[0].modality, 'Doação');
  await act(async () => vm.setQuery('inexistente'));
  assert.equal(vm.examples.length, 0);
  await act(async () => vm.resetSearch());
  assert.equal(vm.examples.length, 3);
  await act(async () => vm.openExample(vm.examples[0]));
  assert.equal(vm.selectedBook.id, 'jardim');
  await act(async () => window.dispatchEvent(new window.HashChangeEvent('hashchange')));
  assert.equal(vm.selectedBook, null);
  await act(async () => root.unmount());
  dom.window.close();
});
