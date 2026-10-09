import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, publicationsLine } from '../src/model/services/profileSummary.ts';

const listing = (status) => ({
  id: `id-${status}-${Math.random()}`,
  title: 'Livro',
  author: 'Autora',
  category: 'Outros',
  modality: 'donation',
  priceCents: null,
  tradeTerms: null,
  condition: 'bom',
  neighborhood: null,
  city: null,
  description: null,
  coverPath: null,
  coverUrl: null,
  status,
  createdAt: '2026-10-02T12:00:00Z',
});

test('o resumo conta cada situação', () => {
  const summary = summarize([
    listing('disponivel'),
    listing('disponivel'),
    listing('arquivado'),
    listing('reservado'),
  ]);
  assert.equal(summary.total, 4);
  assert.equal(summary.disponivel, 2);
  assert.equal(summary.arquivado, 1);
  assert.equal(summary.reservado, 1);
  assert.equal(summary.concluido, 0);
});

test('sem anúncio, o perfil convida em vez de mostrar zeros', () => {
  assert.match(publicationsLine(summarize([])), /ainda não anunciou/i);
});

test('a frase não lista situação que não existe', () => {
  const line = publicationsLine(summarize([listing('disponivel')]));
  assert.equal(line, '1 ativa');
  assert.doesNotMatch(line, /concluída|arquivada|reservada/);
});

test('singular e plural concordam', () => {
  const duas = publicationsLine(summarize([listing('disponivel'), listing('disponivel')]));
  assert.equal(duas, '2 ativas');
  const mistura = publicationsLine(
    summarize([listing('disponivel'), listing('reservado'), listing('concluido')]),
  );
  assert.equal(mistura, '1 ativa, 1 reservada, 1 concluída');
});
