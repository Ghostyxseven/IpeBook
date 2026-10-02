import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePage,
  documents,
  legalLinks,
  contact,
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
  assert.match(JSON.stringify(documents.termos), /Entrar e Criar conta apenas mostram um aviso/);
  assert.match(JSON.stringify(documents.termos), /aplicativo.*permite criar uma conta/);
  assert.match(JSON.stringify(documents.termos), /Nenhuma versão permite publicar anúncios/);
  assert.match(
    JSON.stringify(documents.privacidade),
    /controlador.*pessoas físicas.*identificação individual do controlador ainda não foi divulgada/,
  );
  assert.match(JSON.stringify(documents.privacidade), /não instala cookies/);
  // A política precisa descrever o que o código realmente usa (constituição).
  assert.match(JSON.stringify(documents.privacidade), /Supabase/);
  assert.match(JSON.stringify(documents.privacidade), /Vercel Web Analytics.*Speed Insights/);
  assert.doesNotMatch(JSON.stringify(documents), /não usa.*ferramentas de análise de visitas/);
  assert.match(JSON.stringify(documents.lgpd), /sem prazo de resposta garantido/);
  // O e-mail foi informado pelo projeto; qualquer outro contato continua proibido.
  assert.equal(contact.email, 'ipebook738@gmail.com');
  const emails = JSON.stringify(documents).match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];
  assert.ok(emails.length > 0 && emails.every((email) => email === contact.email));
  assert.doesNotMatch(JSON.stringify(documents), /mailto:|100%/);
  assert.match(JSON.stringify(documents.privacidade), /projeto de faculdade, sem fins lucrativos/);
  assert.match(
    JSON.stringify(documents.termos),
    /não cobra comissão nem recebe o valor das vendas/,
  );
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
  assert.match(JSON.stringify(documents.privacidade), /primeiro nome de quem anunciou/);
  assert.match(JSON.stringify(documents.privacidade), /bairro, cidade/);
  assert.match(
    JSON.stringify(documents.termos),
    /catálogo de livros anunciados por outras pessoas/,
  );
  assert.doesNotMatch(JSON.stringify(documents), /área inicial em construção/);
  for (const doc of Object.values(documents)) {
    assert.ok(doc.summary.length >= 3);
    assert.ok(doc.sources.length > 0);
    for (const source of doc.sources) assert.equal(new URL(source.url).protocol, 'https:');
  }
});
