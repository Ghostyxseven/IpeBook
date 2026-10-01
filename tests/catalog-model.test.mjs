import test from 'node:test';
import assert from 'node:assert/strict';
import { CatalogError, toCatalogError } from '../src/model/entities/CatalogError.ts';
import { emptyFilters } from '../src/model/entities/Listing.ts';
import { catalogErrorMessage } from '../src/model/services/catalogMessages.ts';
import { categories, isCategory } from '../src/model/services/categories.ts';
import {
  activeFilterCount,
  effectiveFilters,
  exploreTitle,
  hasActiveSearch,
  normalizeQuery,
  resultSummary,
  toLikePattern,
  toggleModality,
} from '../src/model/services/catalogFilters.ts';
import { firstName, greeting } from '../src/model/services/userFormat.ts';
import {
  listingDetails,
  listingMeta,
  coverIndex,
  detailHeadline,
  detailMeta,
  modalitySummary,
  tileValue,
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

test('textos do Figma para lista, Início e detalhe', () => {
  assert.equal(modalitySummary(listing), 'Venda · R$ 25,00');
  assert.equal(modalitySummary({ modality: 'trade', priceCents: null }), 'Disponível para troca');
  assert.equal(modalitySummary({ modality: 'donation', priceCents: null }), 'Doação · Gratuito');
  assert.equal(tileValue({ modality: 'trade', priceCents: null }), 'Para trocar');
  assert.equal(tileValue(listing), 'R$ 25,00');
  assert.deepEqual(detailHeadline(listing), { value: 'R$ 25,00', label: 'À VENDA' });
  assert.deepEqual(detailHeadline({ modality: 'trade', priceCents: null }), {
    value: 'Troca',
    label: 'POR OUTRO LIVRO',
  });
  assert.deepEqual(detailHeadline({ modality: 'donation', priceCents: null }), {
    value: 'Gratuito',
    label: 'DOAÇÃO',
  });
  assert.equal(detailMeta(listing), 'BOM ESTADO · LITERATURA BRASILEIRA');
});

test('título e resumo do Explorar acompanham os filtros', () => {
  assert.equal(exploreTitle(emptyFilters, false), 'Encontre sua próxima história.');
  assert.equal(exploreTitle({ ...emptyFilters, modalities: ['sale'] }, false), 'Livros à venda.');
  assert.equal(
    exploreTitle({ ...emptyFilters, modalities: ['sale', 'trade'] }, false),
    'Encontre sua próxima história.',
  );
  assert.equal(
    exploreTitle({ ...emptyFilters, query: 'astronomia' }, true),
    'Ainda não encontramos.',
  );
  assert.equal(exploreTitle(emptyFilters, true), 'Encontre sua próxima história.');
  assert.equal(resultSummary(3, emptyFilters), '3 livros · Mais recentes');
  assert.equal(resultSummary(1, { ...emptyFilters, modalities: ['sale'] }), '1 livro · Venda');
  assert.equal(resultSummary(null, emptyFilters), 'Mais recentes');
});

test('cor da capa ilustrativa é estável para o mesmo anúncio', () => {
  assert.equal(coverIndex('abc', 3), coverIndex('abc', 3));
  for (const id of ['a', 'b', 'c', 'uuid-1', 'uuid-2']) {
    const index = coverIndex(id, 3);
    assert.ok(index >= 0 && index < 3);
  }
  assert.equal(coverIndex('x', 0), 0);
});

test('linha de apoio dos cards junta estado e localização disponível', () => {
  assert.equal(listingMeta(listing), 'Bom estado · Centro, Picos');
  assert.equal(listingMeta({ ...listing, neighborhood: null, city: null }), 'Bom estado');
});

test('detalhe decide parágrafos, quem anunciou e notas pelas regras da modalidade', () => {
  const sale = listingDetails({ ...listing, description: 'Bem conservado.' });
  assert.deepEqual(sale.paragraphs, ['Bem conservado.']);
  assert.equal(sale.owner, 'Ana · Centro, Picos');
  assert.match(sale.notes, /^Capa ilustrativa · Publicado em 30 de set\. de 2026$/);
  assert.deepEqual(sale.headline, { value: 'R$ 25,00', label: 'À VENDA' });

  const trade = listingDetails({
    ...listing,
    modality: 'trade',
    priceCents: null,
    tradeTerms: 'Troco por um romance.',
    description: 'Capa gasta.',
  });
  assert.deepEqual(trade.paragraphs, ['Troco por um romance.', 'Capa gasta.'], 'condições antes');

  const withoutTerms = listingDetails({ ...listing, tradeTerms: 'ignorado na venda' });
  assert.deepEqual(withoutTerms.paragraphs, [], 'venda nunca mostra condições de troca');

  const anonymous = listingDetails({
    ...listing,
    ownerFirstName: null,
    neighborhood: null,
    city: null,
    coverUrl: 'https://cdn/capa.jpg',
    description: '  ',
  });
  assert.equal(anonymous.owner, null);
  assert.deepEqual(anonymous.paragraphs, [], 'descrição em branco não vira parágrafo');
  assert.doesNotMatch(anonymous.notes, /Capa ilustrativa/, 'com foto não há aviso de capa');
});

test('saudação usa só o primeiro nome e tolera cadastro sem nome', () => {
  assert.equal(firstName('  Ana   Paula Souza '), 'Ana');
  assert.equal(firstName(''), null);
  assert.equal(firstName(undefined), null);
  assert.equal(greeting('Micael Cardoso Reis'), 'Olá, Micael');
  assert.equal(greeting(null), 'Olá');
});
