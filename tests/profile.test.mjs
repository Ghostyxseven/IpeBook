import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, summaryLine } from '../src/model/services/profileSummary.ts';

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
  assert.match(summaryLine(summarize([])), /ainda não anunciou/i);
});

test('a frase não lista situação que não existe', () => {
  const line = summaryLine(summarize([listing('disponivel')]));
  assert.match(line, /1 livro anunciado/);
  assert.match(line, /1 disponível/);
  assert.doesNotMatch(line, /concluído|arquivado|reservado/);
});

test('singular e plural concordam', () => {
  const two = summaryLine(summarize([listing('disponivel'), listing('disponivel')]));
  assert.match(two, /2 livros anunciados/);
  assert.match(two, /2 disponíveis/);
});
