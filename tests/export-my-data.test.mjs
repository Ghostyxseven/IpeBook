import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMyDataExport, myDataExportText } from '../src/model/services/exportMyData.ts';

const user = { id: 'u1', name: 'Maria', email: 'maria@example.com', emailVerified: true };
const profile = { neighborhood: 'Prado', city: 'Piripiri, PI' };
const publicProfile = {
  userId: 'u1',
  firstName: 'Maria',
  memberSince: '2026-01-01T00:00:00Z',
  completedCount: 2,
  ratingAverage: 4.5,
  ratingCount: 2,
};
const baseInput = {
  user,
  profile,
  listings: [],
  sentRequests: [],
  receivedRequests: [],
  publicProfile,
  ratingsReceived: [],
  history: [],
};

test('não inclui e-mail nem senha nos dados exportados', () => {
  const data = buildMyDataExport(baseInput);
  const text = JSON.stringify(data);
  assert.ok(!text.includes('maria@example.com'), 'e-mail não deve aparecer no export');
  assert.ok(!('senha' in data.perfil), 'não há campo de senha no perfil exportado');
});

test('traduz modalidade e situação do anúncio para português', () => {
  const data = buildMyDataExport({
    ...baseInput,
    listings: [
      {
        id: 'l1',
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        category: 'Literatura brasileira',
        modality: 'trade',
        priceCents: null,
        tradeTerms: 'Troco por outro clássico',
        condition: 'bom',
        neighborhood: 'Prado',
        city: 'Piripiri, PI',
        description: null,
        coverUrl: null,
        status: 'disponivel',
        coverPath: null,
        createdAt: '2026-10-01T00:00:00Z',
      },
    ],
  });
  assert.equal(data.anuncios.length, 1);
  assert.equal(data.anuncios[0].modalidade, 'Troca');
  assert.equal(data.anuncios[0].situacao, 'Disponível');
  assert.equal(data.anuncios[0].precoReais, null);
});

test('converte preço de centavos para reais só quando existe', () => {
  const data = buildMyDataExport({
    ...baseInput,
    listings: [
      {
        id: 'l2',
        title: 'Livro',
        author: 'Autor',
        category: 'Outros',
        modality: 'sale',
        priceCents: 2500,
        tradeTerms: null,
        condition: 'novo',
        neighborhood: null,
        city: null,
        description: null,
        coverUrl: null,
        status: 'concluido',
        coverPath: null,
        createdAt: '2026-10-01T00:00:00Z',
      },
    ],
  });
  assert.equal(data.anuncios[0].precoReais, 25);
  assert.equal(data.anuncios[0].situacao, 'Concluído');
});

test('usa "Pessoa da comunidade" quando não há nome de quem avaliou ou negociou', () => {
  const data = buildMyDataExport({
    ...baseInput,
    ratingsReceived: [
      {
        id: 'r1',
        authorFirstName: null,
        score: 5,
        comment: null,
        createdAt: '2026-10-01T00:00:00Z',
      },
    ],
    history: [
      {
        requestId: 'req1',
        listingId: 'l1',
        title: 'Livro',
        author: 'Autor',
        modality: 'donation',
        otherPersonId: null,
        otherFirstName: null,
        iWasOwner: true,
        rated: false,
        completedAt: '2026-10-01T00:00:00Z',
      },
    ],
  });
  assert.equal(data.reputacao.avaliacoesRecebidas[0].de, 'Pessoa da comunidade');
  assert.equal(data.historico[0].comQuem, 'Pessoa da comunidade');
});

test('myDataExportText devolve um JSON legível', () => {
  const text = myDataExportText(baseInput);
  const parsed = JSON.parse(text);
  assert.equal(parsed.perfil.nome, 'Maria');
  assert.ok(text.includes('\n'), 'o texto deve estar formatado, não numa linha só');
});
