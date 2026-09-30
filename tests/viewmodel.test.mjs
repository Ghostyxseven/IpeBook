import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useInstitutionalViewModel } from '../src/viewmodel/useInstitutionalViewModel.ts';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let model;
function Probe() {
  model = useInstitutionalViewModel();
  return null;
}

test('navegação preserva destinos e fecha estados transitórios', async () => {
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  assert.equal(model.page, 'inicio');
  await act(async () => model.toggleMenu());
  assert.equal(model.menuOpen, true);
  await act(async () => model.openAccess('criar'));
  assert.equal(model.menuOpen, false);
  assert.equal(model.accessIntent, 'criar');
  await act(async () => {
    window.history.replaceState(null, '', '#privacidade');
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  });
  assert.equal(model.document.title, 'Política de Privacidade');
  assert.equal(model.accessIntent, null);
  await act(async () => {
    window.history.replaceState(null, '', '#como-funciona');
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  });
  assert.equal(model.page, 'inicio');
  assert.equal(model.document, null);
  await act(async () => model.openAccess('entrar'));
  await act(async () => model.closeAccess());
  assert.equal(model.accessIntent, null);
  await act(async () => root.unmount());
  dom.window.close();
});
