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
  toggleCondition,
  toggleModality,
  normalizeMaxPrice,
  maxPriceLabel,
  MAX_PRICE_CENTS,
  PRICE_STEP_CENTS,
} from '../src/model/services/catalogFilters.ts';
import { firstName, greeting } from '../src/model/services/userFormat.ts';
import {
  listingDetails,
  listingMeta,
  coverIndex,
  detailHeadline,
  detailActionLabel,
  detailSignedOutLabel,
  detailMeta,
  modalitySummary,
  cardOverline,
  cardValue,
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

test('filtros contam modalidades sem repetição, categoria, conservação e preço', () => {
  const filters = {
    ...emptyFilters,
    query: 'x',
    modalities: ['sale', 'sale', 'trade'],
    category: 'Quadrinhos',
  };
  assert.deepEqual(effectiveFilters(filters), {
    query: '',
    modalities: ['sale', 'trade'],
    category: 'Quadrinhos',
    conditions: [],
    maxPriceCents: null,
  });
  assert.equal(activeFilterCount(filters), 3);
  assert.equal(activeFilterCount({ ...filters, conditions: ['novo', 'bom'] }), 5);
  assert.equal(activeFilterCount({ ...filters, maxPriceCents: 3000 }), 4);
  assert.equal(activeFilterCount(emptyFilters), 0);
});

test('conservações saem na ordem do Figma e sem repetição (Figma 02.03)', () => {
  const { conditions } = effectiveFilters({
    ...emptyFilters,
    conditions: ['marcas_de_uso', 'novo', 'novo'],
  });
  assert.deepEqual(conditions, ['novo', 'marcas_de_uso']);
  assert.deepEqual(toggleCondition([], 'bom'), ['bom']);
  assert.deepEqual(toggleCondition(['bom', 'novo'], 'bom'), ['novo']);
});

test('preço máximo fica na faixa do controle, no passo, e zero não limita', () => {
  assert.equal(normalizeMaxPrice(null), null);
  assert.equal(normalizeMaxPrice(0), null);
  assert.equal(normalizeMaxPrice(-500), null);
  assert.equal(normalizeMaxPrice(3), PRICE_STEP_CENTS);
  assert.equal(normalizeMaxPrice(3040), 3000);
  assert.equal(normalizeMaxPrice(MAX_PRICE_CENTS + 10000), MAX_PRICE_CENTS);
  assert.equal(maxPriceLabel(null), 'Qualquer preço');
  assert.equal(maxPriceLabel(3000), 'Até R$ 30,00');
});

test('o resumo do Explorar junta modalidade, categoria, conservação e preço (Figma 02.04)', () => {
  assert.equal(
    resultSummary(1, {
      ...emptyFilters,
      modalities: ['sale'],
      category: 'Literatura brasileira',
      conditions: ['bom'],
      maxPriceCents: 3000,
    }),
    '1 livro · Venda · Literatura brasileira · Bom estado · Até R$ 30,00',
  );
  assert.equal(resultSummary(2, emptyFilters), '2 livros · Mais recentes');
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
  assert.equal(cardOverline(listing), 'Venda · R$ 25,00');
  assert.equal(cardOverline({ modality: 'trade', priceCents: null }), 'Troca');
  assert.equal(cardOverline({ modality: 'donation', priceCents: null }), 'Doação');
  assert.equal(
    cardValue({ modality: 'trade', priceCents: null, tradeTerms: ' Por outro livro ' }),
    'Por outro livro',
  );
  assert.equal(cardValue({ modality: 'trade', priceCents: null, tradeTerms: null }), 'Para trocar');
  assert.equal(cardValue({ modality: 'donation', priceCents: null, tradeTerms: null }), 'Gratuito');
  // O selo do detalhe é sempre a modalidade escrita, como o componente Tag do Figma.
  assert.deepEqual(detailHeadline(listing), { value: 'R$ 25,00', label: 'Venda' });
  assert.deepEqual(detailHeadline({ modality: 'trade', priceCents: null }), {
    value: 'Por outro livro',
    label: 'Troca',
  });
  assert.deepEqual(detailHeadline({ modality: 'donation', priceCents: null }), {
    value: 'Gratuito',
    label: 'Doação',
  });
  assert.equal(detailMeta(listing), 'Bom estado · Literatura brasileira');
});

test('título e resumo do Explorar acompanham os filtros', () => {
  assert.equal(exploreTitle(emptyFilters, false), 'O que vamos ler hoje?');
  assert.equal(exploreTitle({ ...emptyFilters, modalities: ['sale'] }, false), 'Livros à venda.');
  assert.equal(
    exploreTitle({ ...emptyFilters, modalities: ['sale', 'trade'] }, false),
    'O que vamos ler hoje?',
  );
  assert.equal(
    exploreTitle({ ...emptyFilters, query: 'astronomia' }, true),
    'Ainda não encontramos.',
  );
  assert.equal(exploreTitle(emptyFilters, true), 'O que vamos ler hoje?');
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
  assert.deepEqual(sale.headline, { value: 'R$ 25,00', label: 'Venda' });

  const trade = listingDetails({
    ...listing,
    modality: 'trade',
    priceCents: null,
    tradeTerms: 'Troco por um romance.',
    description: 'Capa gasta.',
  });
  assert.deepEqual(trade.paragraphs, ['Capa gasta.'], 'condições saem no cartão, não aqui');
  assert.deepEqual(trade.modalityNote, {
    title: 'Aceita em troca',
    text: 'Troco por um romance.',
  });

  const withoutTerms = listingDetails({ ...listing, tradeTerms: 'ignorado na venda' });
  assert.deepEqual(withoutTerms.paragraphs, [], 'venda nunca mostra condições de troca');
  assert.equal(withoutTerms.modalityNote, null, 'venda não tem cartão informativo');

  const donation = listingDetails({ ...listing, modality: 'donation', priceCents: null });
  assert.deepEqual(donation.modalityNote, {
    title: 'Doação para quem vai ler',
    text: 'Sem cobrança pelo exemplar. Retirada em local público, combinada pelo chat.',
  });
  assert.deepEqual(sale.facts, [
    { label: 'Conservação', value: 'Bom estado' },
    { label: 'Categoria', value: 'Literatura brasileira' },
    { label: 'Retirada', value: 'Centro, Picos' },
  ]);

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

test('a ação do detalhe diz o que a pessoa está pedindo (Figma 03.01 a 03.03)', () => {
  assert.equal(detailActionLabel('sale'), 'Combinar encontro');
  assert.equal(detailActionLabel('trade'), 'Propor troca');
  assert.equal(detailActionLabel('donation'), 'Quero receber');
});

test('quem não entrou vê o rótulo no infinitivo, sem frase quebrada', () => {
  assert.equal(detailSignedOutLabel('sale'), 'Entrar para combinar encontro');
  assert.equal(detailSignedOutLabel('trade'), 'Entrar para propor troca');
  assert.equal(detailSignedOutLabel('donation'), 'Entrar para receber o livro');
  // "Quero receber" é primeira pessoa: interpolar daria "Entrar para quero receber".
  for (const modality of ['sale', 'trade', 'donation']) {
    assert.doesNotMatch(detailSignedOutLabel(modality), /\bquero\b/i);
  }
});
