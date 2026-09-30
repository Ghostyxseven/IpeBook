import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePage,
  documents,
  legalLinks,
  instagram,
} from '../src/model/services/institutional.ts';

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
  // O perfil informado pelo usuário agora é permitido; contatos inventados continuam proibidos.
  assert.doesNotMatch(JSON.stringify(documents), /mailto:|100%/);
  assert.equal(instagram.url, 'https://www.instagram.com/ipebook/');
  assert.match(JSON.stringify(documents.lgpd), /Instagram não foi definido como canal formal/);
});

test('segurança resolve por endereço e os documentos distinguem demonstração de operação', () => {
  assert.equal(resolvePage('#seguranca'), 'seguranca');
  assert.equal(documents.seguranca.title, 'Segurança');
  assert.match(JSON.stringify(documents.seguranca), /não recebe pagamentos/);
  assert.match(JSON.stringify(documents.termos), /exemplos fictícios/);
  assert.match(JSON.stringify(documents.privacidade), /Não envia a consulta/);
  assert.match(JSON.stringify(documents.privacidade), /não incorporamos/);
  assert.match(JSON.stringify(documents.privacidade), /registros.*finalidades.*bases legais/);
  for (const doc of Object.values(documents)) {
    assert.ok(doc.summary.length >= 3);
    assert.ok(doc.sources.length > 0);
    for (const source of doc.sources) assert.equal(new URL(source.url).protocol, 'https:');
  }
});
