import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { canonicalPath, legalLinks, resolveRoute } from '../src/model/services/institutional.ts';
import { useInstitutionalViewModel } from '../src/viewmodel/useInstitutionalViewModel.ts';

test('documentos têm endereço próprio e capítulos continuam em fragmentos da raiz', () => {
  for (const link of legalLinks) {
    assert.equal(link.href, `/${link.id}`);
    assert.equal(resolveRoute(`/${link.id}`, ''), link.id);
    assert.equal(resolveRoute(`/${link.id}/`, '#sobre'), link.id, 'barra final e fragmento');
  }
  assert.equal(resolveRoute('/', '#sobre'), 'inicio');
  assert.equal(resolveRoute('/', ''), 'inicio');
  assert.equal(resolveRoute('/', '#privacidade'), 'privacidade', 'link antigo');
  for (const path of ['/xyz', '/privacidade/extra', '/index.html', '/__proto__']) {
    assert.equal(resolveRoute(path, ''), 'inicio');
  }
});

test('o endereço canônico corrige links antigos e desconhecidos sem mexer nos válidos', () => {
  assert.equal(canonicalPath('/', '#privacidade'), '/privacidade');
  assert.equal(canonicalPath('/', '#sobre'), null);
  assert.equal(canonicalPath('/', ''), null);
  assert.equal(canonicalPath('/privacidade', ''), null);
  assert.equal(canonicalPath('/privacidade/', '#topo'), null);
  assert.equal(canonicalPath('/xyz', '#sobre'), '/#sobre');
  assert.equal(canonicalPath('/xyz', ''), '/');
});

async function mount(url) {
  const dom = new JSDOM('<div id="root"></div>', { url });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let vm;
  function Probe() {
    vm = useInstitutionalViewModel();
    return null;
  }
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return vm;
    },
    window: dom.window,
    close: async () => {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}

test('abrir um documento pelo endereço mostra o documento', async () => {
  const app = await mount('http://localhost/privacidade');
  assert.equal(app.vm.page, 'privacidade');
  assert.equal(app.vm.document.title, 'Política de Privacidade');
  assert.equal(app.window.location.pathname, '/privacidade');
  await app.close();
});

test('link antigo /#termos e caminho desconhecido passam para o endereço canônico', async () => {
  const old = await mount('http://localhost/#termos');
  assert.equal(old.vm.page, 'termos');
  assert.equal(old.window.location.pathname, '/termos');
  assert.equal(old.window.location.hash, '');
  await old.close();
  const unknown = await mount('http://localhost/xyz#sobre');
  assert.equal(unknown.vm.page, 'inicio');
  assert.equal(unknown.window.location.pathname, '/');
  assert.equal(unknown.window.location.hash, '#sobre');
  await unknown.close();
});

test('navegar entre documentos e capítulos usa o histórico e fecha estados transitórios', async () => {
  const app = await mount('http://localhost/#sobre');
  assert.equal(app.vm.page, 'inicio');
  await act(async () => app.vm.openAccess('entrar'));
  assert.equal(app.vm.accessIntent, 'entrar');
  await act(async () => app.vm.navigate('/lgpd'));
  assert.equal(app.vm.page, 'lgpd');
  assert.equal(app.window.location.pathname, '/lgpd');
  assert.equal(app.vm.accessIntent, null);
  assert.equal(app.window.history.length, 2, 'cria uma entrada de histórico');
  await act(async () => app.vm.navigate('/#como-funciona'));
  assert.equal(app.vm.page, 'inicio');
  assert.equal(app.window.location.pathname, '/');
  assert.equal(app.vm.hash, '#como-funciona');
  await act(async () => {
    app.window.history.back();
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  assert.equal(app.vm.page, 'lgpd', 'voltar restaura o documento');
  await app.close();
});

test('na mesma página, ir para outro capítulo só troca o fragmento', async () => {
  const app = await mount('http://localhost/#inicio');
  await act(async () => {
    app.vm.navigate('/#duvidas');
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  assert.equal(app.window.location.hash, '#duvidas');
  assert.equal(app.vm.hash, '#duvidas');
  assert.equal(app.window.history.length, 2);
  await app.close();
});
