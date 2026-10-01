import test from 'node:test';
import assert from 'node:assert/strict';
import { CatalogError, toCatalogError } from '../src/model/entities/CatalogError.ts';
import { emptyFilters } from '../src/model/entities/Listing.ts';
import { catalogErrorMessage } from '../src/model/services/catalogMessages.ts';
import { categories, isCategory } from '../src/model/services/categories.ts';
import {
  activeFilterCount,
  effectiveFilters,
  hasActiveSearch,
  normalizeQuery,
  toLikePattern,
  toggleModality,
} from '../src/model/services/catalogFilters.ts';
import {
  formatBRL,
  listingAccessibilityLabel,
  locationLabel,
  priceLabel,
  publishedLabel,
} from '../src/model/services/catalogFormat.ts';

const listing = {
  id: '1',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  category: 'Literatura brasileira',
  modality: 'sale',
  priceCents: 2500,
  tradeTerms: null,
  condition: 'bom',
  neighborhood: 'Centro',
  city: 'Picos',
  description: null,
  coverUrl: null,
  status: 'disponivel',
  ownerFirstName: 'Ana',
  createdAt: '2026-09-30T12:00:00Z',
};

test('preço em BRL com separadores brasileiros', () => {
  assert.equal(formatBRL(2500), 'R$ 25,00');
  assert.equal(formatBRL(5), 'R$ 0,05');
  assert.equal(formatBRL(123456789), 'R$ 1.234.567,89');
});

test('preço só na venda, gratuidade na doação e nada na troca', () => {
  assert.equal(priceLabel(listing), 'R$ 25,00');
  assert.equal(priceLabel({ modality: 'donation', priceCents: null }), 'Gratuito');
  assert.equal(priceLabel({ modality: 'trade', priceCents: null }), null);
  assert.equal(priceLabel({ modality: 'sale', priceCents: null }), null);
});

test('localização usa só bairro e cidade disponíveis', () => {
  assert.equal(locationLabel(listing), 'Centro, Picos');
  assert.equal(locationLabel({ neighborhood: ' ', city: 'Picos' }), 'Picos');
  assert.equal(locationLabel({ neighborhood: null, city: null }), null);
});

test('data de publicação legível e tolerante a valor inválido', () => {
  assert.match(publishedLabel('2026-09-30T12:00:00Z'), /^Publicado em 30 de set\. de 2026$/);
  assert.equal(publishedLabel('ontem'), null);
});

test('rótulo acessível do card reúne título, autor, modalidade, preço e situação', () => {
  assert.equal(
    listingAccessibilityLabel(listing),
    'Dom Casmurro, de Machado de Assis, Venda, R$ 25,00, Bom estado, Centro, Picos',
  );
  assert.match(
    listingAccessibilityLabel({
      ...listing,
      modality: 'donation',
      priceCents: null,
      status: 'reservado',
    }),
    /Doação, Gratuito, Reservado/,
  );
});

test('busca ignora texto curto e normaliza espaços', () => {
  assert.equal(normalizeQuery(' a '), '');
  assert.equal(normalizeQuery('  dom   casmurro '), 'dom casmurro');
  assert.equal(hasActiveSearch({ ...emptyFilters, query: 'a' }), false);
  assert.equal(hasActiveSearch({ ...emptyFilters, query: 'do' }), true);
});

test('filtros contam modalidades sem repetição e categoria', () => {
  const filters = { query: 'x', modalities: ['sale', 'sale', 'trade'], category: 'Quadrinhos' };
  assert.deepEqual(effectiveFilters(filters), {
    query: '',
    modalities: ['sale', 'trade'],
    category: 'Quadrinhos',
  });
  assert.equal(activeFilterCount(filters), 3);
  assert.equal(activeFilterCount(emptyFilters), 0);
});

test('alternar modalidade adiciona e remove', () => {
  assert.deepEqual(toggleModality([], 'sale'), ['sale']);
  assert.deepEqual(toggleModality(['sale', 'trade'], 'sale'), ['trade']);
});

test('padrão do ilike trata curingas como texto', () => {
  assert.equal(toLikePattern('50%_off'), '%50\\%\\_off%');
});

test('categorias fixas e mensagens de erro em português', () => {
  assert.equal(categories.length, 8);
  assert.equal(isCategory('Quadrinhos'), true);
  assert.equal(isCategory('Receitas'), false);
  assert.equal(toCatalogError(new Error('x')).code, 'unknown');
  const error = new CatalogError('not_found');
  assert.equal(toCatalogError(error), error);
  assert.match(catalogErrorMessage('not_configured'), /não foi configurado/);
});
