import test from 'node:test';
import assert from 'node:assert/strict';
import { isEditable } from '../src/model/entities/Listing.ts';
import { ListingError, toListingError } from '../src/model/entities/ListingError.ts';
import {
  centsToInput,
  lockedReason,
  modalityHighlight,
  myStatusLabels,
  parseBRLToCents,
} from '../src/model/services/listingFormat.ts';
import {
  emptyDraft,
  isValid,
  normalizeDraft,
  SERVED_CITY,
  validateBookStep,
  validateDraft,
  validateModalityStep,
} from '../src/model/services/listingValidation.ts';
import { createMemoryListingsRepository } from '../src/model/repositories/memoryListingsRepository.ts';

const sale = () => ({
  ...emptyDraft(),
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  category: 'Literatura brasileira',
  modality: 'sale',
  priceCents: 2500,
});

// ── Dinheiro ────────────────────────────────────────────────────────────────

test('preço em reais vira centavos inteiros, nos formatos que as pessoas digitam', () => {
  assert.equal(parseBRLToCents('25'), 2500);
  assert.equal(parseBRLToCents('25,90'), 2590);
  assert.equal(parseBRLToCents('25.90'), 2590);
  assert.equal(parseBRLToCents('R$ 1.234,50'), 123450);
  assert.equal(parseBRLToCents('1,5'), 150);
  assert.equal(parseBRLToCents(''), null);
  assert.equal(parseBRLToCents('abc'), null);
});

test('19,90 não perde o centavo que o ponto flutuante comeria', () => {
  assert.equal(parseBRLToCents('19,90'), 1990);
  assert.ok(Number.isInteger(parseBRLToCents('19,90')));
});

test('separador de milhar sem centavos não vira fração', () => {
  assert.equal(parseBRLToCents('1.234'), 123400);
});

test('centavos voltam para o campo sem o símbolo da moeda', () => {
  assert.equal(centsToInput(2590), '25,90');
  assert.equal(centsToInput(null), '');
});

// ── Validação ───────────────────────────────────────────────────────────────

test('os dados do livro exigem título, autor e uma categoria da lista', () => {
  const errors = validateBookStep({ ...emptyDraft(), category: 'Inventada' });
  assert.ok(errors.title);
  assert.ok(errors.author);
  assert.ok(errors.category);
});

test('venda exige preço maior que zero', () => {
  assert.ok(
    validateModalityStep({ modality: 'sale', priceCents: null, tradeTerms: null }).priceCents,
  );
  assert.ok(validateModalityStep({ modality: 'sale', priceCents: 0, tradeTerms: null }).priceCents);
  assert.ok(isValid(validateModalityStep({ modality: 'sale', priceCents: 1, tradeTerms: null })));
});

test('troca exige as condições e doação não exige nada', () => {
  assert.ok(
    validateModalityStep({ modality: 'trade', priceCents: null, tradeTerms: '  ' }).tradeTerms,
  );
  assert.ok(
    isValid(
      validateModalityStep({ modality: 'trade', priceCents: null, tradeTerms: 'Por ficção' }),
    ),
  );
  assert.ok(
    isValid(validateModalityStep({ modality: 'donation', priceCents: null, tradeTerms: null })),
  );
});

test('trocar a modalidade zera o campo da anterior — a constraint olha a linha inteira', () => {
  const wasSale = { ...sale(), modality: 'donation' };
  assert.equal(normalizeDraft(wasSale).priceCents, null);

  const wasTrade = {
    ...emptyDraft(),
    title: 'A',
    author: 'B',
    category: 'Outros',
    modality: 'sale',
    priceCents: 100,
    tradeTerms: 'Por qualquer um',
  };
  assert.equal(normalizeDraft(wasTrade).tradeTerms, null);
});

test('todo anúncio fica em Piripiri, qualquer que seja a cidade recebida', () => {
  assert.equal(SERVED_CITY, 'Piripiri');
  assert.equal(emptyDraft().city, 'Piripiri');
  assert.equal(normalizeDraft({ ...sale(), city: null }).city, 'Piripiri');
  assert.equal(normalizeDraft({ ...sale(), city: 'Teresina' }).city, 'Piripiri');
});

test('o rascunho normalizado passa na validação completa', () => {
  assert.ok(isValid(validateDraft(normalizeDraft(sale()))));
});

// ── Situações ───────────────────────────────────────────────────────────────

test('só anúncio disponível é editável', () => {
  assert.equal(isEditable('disponivel'), true);
  assert.equal(isEditable('reservado'), false);
  assert.equal(isEditable('concluido'), false);
  assert.equal(isEditable('arquivado'), false);
});

test('reservado e concluído explicam por que estão travados', () => {
  assert.ok(lockedReason('reservado'));
  assert.ok(lockedReason('concluido'));
  assert.equal(lockedReason('disponivel'), null);
});

test('as quatro situações têm rótulo', () => {
  assert.deepEqual(Object.keys(myStatusLabels).sort(), [
    'arquivado',
    'concluido',
    'disponivel',
    'reservado',
  ]);
});

test('o destaque da modalidade mostra preço só na venda', () => {
  assert.equal(modalityHighlight({ modality: 'sale', priceCents: 2500 }), 'R$ 25,00');
  assert.equal(modalityHighlight({ modality: 'trade', priceCents: null }), 'Troca');
  assert.equal(modalityHighlight({ modality: 'donation', priceCents: null }), 'Gratuito');
});

test('erro desconhecido vira ListingError sem perder a causa', () => {
  const original = new Error('boom');
  const error = toListingError(original);
  assert.ok(error instanceof ListingError);
  assert.equal(error.code, 'unknown');
  assert.equal(error.cause, original);
});

// ── Repositório em memória ──────────────────────────────────────────────────

const cover = (filename = 'capa.jpg') => ({
  filename,
  mimeType: 'image/jpeg',
  bytes: new ArrayBuffer(8),
});

test('publicar grava o anúncio como disponível e guarda a capa', async () => {
  const memory = createMemoryListingsRepository();
  const listing = await memory.repository.create(sale(), cover());
  assert.equal(listing.status, 'disponivel');
  assert.equal(listing.priceCents, 2500);
  assert.ok(listing.coverPath);
  assert.equal(memory.covers.size, 1);
});

test('publicar sem foto não inventa capa', async () => {
  const memory = createMemoryListingsRepository();
  const listing = await memory.repository.create(sale(), null);
  assert.equal(listing.coverPath, null);
  assert.equal(listing.coverUrl, null);
});

test('trocar a capa remove a antiga do bucket', async () => {
  const memory = createMemoryListingsRepository();
  const created = await memory.repository.create(sale(), cover('antiga.jpg'));
  const before = created.coverPath;

  const updated = await memory.repository.update(created.id, sale(), {
    kind: 'replace',
    file: cover('nova.jpg'),
  });
  assert.notEqual(updated.coverPath, before);
  assert.equal(memory.covers.has(before), false);
  assert.equal(memory.covers.has(updated.coverPath), true);
});

test('limpar a capa tira o arquivo e deixa o anúncio sem foto', async () => {
  const memory = createMemoryListingsRepository();
  const created = await memory.repository.create(sale(), cover());
  const updated = await memory.repository.update(created.id, sale(), { kind: 'clear' });
  assert.equal(updated.coverPath, null);
  assert.equal(memory.covers.size, 0);
});

test('excluir o anúncio apaga a foto — o bucket é público', async () => {
  const memory = createMemoryListingsRepository();
  const created = await memory.repository.create(sale(), cover());
  await memory.repository.remove(created.id);
  assert.equal(memory.all().length, 0);
  assert.equal(memory.covers.size, 0);
});

test('arquivar some do catálogo e republicar traz de volta', async () => {
  const memory = createMemoryListingsRepository();
  const created = await memory.repository.create(sale(), null);
  assert.equal((await memory.repository.archive(created.id)).status, 'arquivado');
  assert.equal((await memory.repository.republish(created.id)).status, 'disponivel');
});

test('anúncio reservado recusa editar, arquivar e excluir', async () => {
  const memory = createMemoryListingsRepository();
  const created = await memory.repository.create(sale(), null);
  await memory.repository.archive(created.id);
  await memory.repository.republish(created.id);
  // A negociação é quem reserva; aqui simulamos o estado resultante.
  const reserved = { ...created, status: 'reservado' };
  const held = createMemoryListingsRepository([reserved]);

  for (const action of [
    () => held.repository.update(reserved.id, sale(), { kind: 'keep' }),
    () => held.repository.archive(reserved.id),
    () => held.repository.remove(reserved.id),
  ]) {
    await assert.rejects(
      action,
      (error) => error instanceof ListingError && error.code === 'not_allowed',
    );
  }
});

test('rascunho inválido não chega a virar anúncio', async () => {
  const memory = createMemoryListingsRepository();
  await assert.rejects(
    () => memory.repository.create({ ...sale(), title: '   ' }, null),
    (error) => error instanceof ListingError && error.code === 'invalid',
  );
});

test('a estante vem dos mais recentes aos mais antigos', async () => {
  const memory = createMemoryListingsRepository([
    {
      ...sale(),
      id: 'a',
      status: 'disponivel',
      coverPath: null,
      coverUrl: null,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      ...sale(),
      id: 'b',
      status: 'arquivado',
      coverPath: null,
      coverUrl: null,
      createdAt: '2026-06-01T00:00:00Z',
    },
  ]);
  assert.deepEqual(
    (await memory.repository.listMine()).map((item) => item.id),
    ['b', 'a'],
  );
});

test('base64ToArrayBuffer devolve os bytes da imagem, com ou sem prefixo data:', async () => {
  const { base64ToArrayBuffer } = await import('../src/model/services/coverBytes.ts');
  const jpegHeader = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10];
  const base64 = Buffer.from(jpegHeader).toString('base64');
  assert.deepEqual([...new Uint8Array(base64ToArrayBuffer(base64))], jpegHeader);
  assert.deepEqual(
    [...new Uint8Array(base64ToArrayBuffer(`data:image/jpeg;base64,${base64}`))],
    jpegHeader,
  );
});
