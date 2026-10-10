import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft, validateDraft } from '../src/model/services/listingValidation.ts';

const valid = () => ({
  ...emptyDraft(),
  title: 'Livro',
  author: 'Autora',
  category: 'Literatura brasileira',
  modality: 'donation',
});
test('anúncio recusa ponto sem nome ou com coordenadas impossíveis', () => {
  for (const meetingPoint of [
    { name: '', latitude: -4, longitude: -41 },
    { name: 'Praça', latitude: 91, longitude: -41 },
    { name: 'Praça', latitude: NaN, longitude: 0 },
    { name: 'Praça', latitude: 0, longitude: 181 },
  ]) {
    assert.ok(validateDraft({ ...valid(), meetingPoint }).meetingPoint);
  }
});
test('anúncio antigo sem ponto continua válido', () => {
  assert.deepEqual(validateDraft(valid()), {});
});

const { readMeetingPoint, publicMapListings } =
  await import('../src/model/services/meetingPoints.ts');
const { createMemoryListingsRepository } =
  await import('../src/model/repositories/memoryListingsRepository.ts');
const point = { name: ' Praça pública ', latitude: -4.273, longitude: -41.776 };
test('ponto lido não carrega dados pessoais extras', () => {
  assert.deepEqual(readMeetingPoint({ ...point, address: 'segredo', userId: 'pessoa' }), {
    ...point,
    name: 'Praça pública',
  });
  for (const value of [null, {}, 'texto', { ...point, latitude: '1' }])
    assert.equal(readMeetingPoint(value), null);
});
test('mapa só inclui disponíveis com ponto válido e nunca infere do bairro', () => {
  const book = { id: '1', status: 'disponivel', neighborhood: 'Centro', meetingPoint: point };
  assert.deepEqual(
    publicMapListings([
      book,
      { ...book, id: '2', meetingPoint: null },
      { ...book, id: '3', status: 'reservado' },
    ]).map((x) => x.id),
    ['1'],
  );
});
test('criar, editar e remover ponto mantém o livro e não altera dados anteriores', async () => {
  const { repository: repo } = createMemoryListingsRepository();
  const saved = await repo.create({ ...valid(), meetingPoint: point }, null);
  assert.equal(saved.meetingPoint.name, 'Praça pública');
  const changed = await repo.update(saved.id, { ...valid(), meetingPoint: null }, { kind: 'keep' });
  assert.equal(changed.meetingPoint, null);
  assert.equal(saved.meetingPoint.name, 'Praça pública');
});
