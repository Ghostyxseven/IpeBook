import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePage, documents, legalLinks } from '../src/model/services/institutional.ts';

test('documentos legais abrem por endereço e fragmentos da página não viram documentos', () => {
  for (const link of legalLinks) {
    assert.equal(resolvePage(`#${link.id}`), link.id);
    assert.ok(documents[link.id].sections.length > 0);
  }
  for (const hash of ['', '#como-funciona', '#duvidas', '#cookies', '#__proto__']) {
    assert.equal(resolvePage(hash), 'inicio');
  }
});

test('conteúdo delimita operação e identifica pendências sem contato inventado', () => {
  assert.match(JSON.stringify(documents.termos), /não permite criar contas/);
  assert.match(JSON.stringify(documents.privacidade), /controlador.*pendentes/);
  assert.match(JSON.stringify(documents.privacidade), /não instala cookies/);
  assert.match(JSON.stringify(documents.lgpd), /não está disponível/);
  assert.doesNotMatch(JSON.stringify(documents), /mailto:|@ipebook|100%/);
});
