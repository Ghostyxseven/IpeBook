import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useMeetingLocation } from '../src/viewmodel/useMeetingLocation.ts';
import { useListingForm } from '../src/viewmodel/useListingForm.ts';
import { useEditListingViewModel } from '../src/viewmodel/useEditListingViewModel.ts';
import { createMemoryListingsRepository } from '../src/model/repositories/memoryListingsRepository.ts';
import { createMemoryCatalogRepository } from '../src/model/repositories/memoryCatalogRepository.ts';
import { emptyFilters } from '../src/model/entities/Listing.ts';
const dom = new JSDOM('<html></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const point = { name: 'Praça pública', latitude: -4.273, longitude: -41.776 };
async function hook(useHook) {
  let current;
  const root = createRoot(document.createElement('div'));
  function Probe() {
    current = useHook();
    return null;
  }
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return current;
    },
    close: () => act(async () => root.unmount()),
  };
}
test('mudar local por texto descarta coordenadas, remover ponto mantém nome', async () => {
  const h = await hook(useMeetingLocation);
  await act(async () => h.vm.chooseMeetingPoint(point));
  assert.equal(h.vm.publicLocation, point.name);
  await act(async () => h.vm.setPublicLocation('Outro lugar'));
  assert.equal(h.vm.meetingPoint, null);
  await act(async () => h.vm.chooseMeetingPoint(point));
  await act(async () => h.vm.chooseMeetingPoint(null));
  assert.equal(h.vm.publicLocation, point.name);
  assert.equal(h.vm.meetingPoint, null);
  await h.close();
});
test('formulário preserva ponto ao retomar e permite remover', async () => {
  const h = await hook(useListingForm);
  await act(async () => h.vm.setMeetingPoint(point));
  assert.deepEqual(h.vm.toSubmit().meetingPoint, point);
  const saved = h.vm.draft;
  await act(async () => h.vm.reset(saved));
  assert.deepEqual(h.vm.draft.meetingPoint, point);
  await act(async () => h.vm.setMeetingPoint(null));
  assert.equal(h.vm.toSubmit().meetingPoint, null);
  await h.close();
});
test('edição carrega ponto sem perder coordenadas', async () => {
  const { repository } = createMemoryListingsRepository([
    { id: 'livro', status: 'disponivel', meetingPoint: point, priceCents: null },
  ]);
  const h = await hook(() => useEditListingViewModel(repository, 'livro'));
  assert.deepEqual(h.vm.draft.meetingPoint, point);
  await h.close();
});
test('mapa filtra antes da paginação, incluindo pontos de páginas posteriores', async () => {
  const base = {
    title: 'Livro',
    author: 'Autora',
    category: 'Contos',
    status: 'disponivel',
    createdAt: '2026-10-09',
    modality: 'donation',
    priceCents: null,
  };
  const { repository } = createMemoryCatalogRepository([
    { ...base, id: '3' },
    { ...base, id: '2', meetingPoint: point },
    { ...base, id: '1', meetingPoint: point, status: 'reservado' },
  ]);
  const page = await repository.list({
    filters: { ...emptyFilters, meetingPointsOnly: true },
    cursor: null,
    limit: 1,
  });
  assert.deepEqual(
    page.items.map((x) => x.id),
    ['2'],
  );
  assert.equal(page.total, 1);
});

const { useMeetingPointPicker } = await import('../src/viewmodel/useMeetingPointPicker.ts');
const { useBooksMapViewModel } = await import('../src/viewmodel/useBooksMapViewModel.ts');
test('ponto só é confirmado após declaração e cancelar preserva o valor anterior', async () => {
  const changes = [];
  const h = await hook(() => useMeetingPointPicker(point, (next) => changes.push(next)));
  await act(async () => h.vm.open());
  assert.equal(h.vm.canConfirm, false);
  await act(async () => h.vm.confirm());
  assert.deepEqual(changes, []);
  await act(async () => h.vm.toggleConfirmed());
  assert.equal(h.vm.canConfirm, true);
  await act(async () => h.vm.select({ latitude: -4.28, longitude: -41.78 }));
  assert.equal(h.vm.canConfirm, false);
  await act(async () => h.vm.close());
  assert.deepEqual(changes, []);
  await act(async () => h.vm.open());
  await act(async () => h.vm.toggleConfirmed());
  await act(async () => h.vm.confirm());
  assert.deepEqual(changes, [point]);
  await h.close();
});
test('capas no mesmo ponto agrupam e a seleção abre todos os livros do local', async () => {
  const books = [
    { id: 'a', title: 'A', modality: 'donation', status: 'disponivel', meetingPoint: point },
    { id: 'b', title: 'B', modality: 'donation', status: 'disponivel', meetingPoint: point },
  ];
  const h = await hook(() => useBooksMapViewModel(books));
  assert.equal(h.vm.markers.length, 1);
  assert.equal(h.vm.markers[0].count, 2);
  assert.equal('ownerId' in h.vm.markers[0], false);
  await act(async () => h.vm.select(h.vm.markers[0].id));
  assert.deepEqual(
    h.vm.visibleBooks.map((b) => b.id),
    ['a', 'b'],
  );
  await h.close();
});
