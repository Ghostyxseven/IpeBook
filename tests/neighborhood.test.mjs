import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { LocationError } from '../src/model/entities/Location.ts';
import { ProfileError } from '../src/model/entities/Profile.ts';
import { createMemoryProfileRepository } from '../src/model/repositories/memoryProfileRepository.ts';
import {
  createSupabaseProfileRepository,
  mapSupabaseProfileError,
} from '../src/model/repositories/supabaseProfileRepository.ts';
import {
  SUGGESTED_NEIGHBORHOODS,
  neighborhoodFromAddress,
  normalizeNeighborhood,
  validateNeighborhood,
} from '../src/model/services/neighborhood.ts';
import { useLocateNeighborhoodViewModel } from '../src/viewmodel/useLocateNeighborhoodViewModel.ts';
import { useNeighborhoodViewModel } from '../src/viewmodel/useNeighborhoodViewModel.ts';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

async function renderHook(useHook) {
  const holder = { current: null };
  function Probe() {
    holder.current = useHook();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () => root.render(React.createElement(Probe)));
  return {
    get vm() {
      return holder.current;
    },
    unmount: () => act(async () => root.unmount()),
  };
}

test('bairro: sugestões do Figma 01.17, normalização e validação', () => {
  assert.deepEqual([...SUGGESTED_NEIGHBORHOODS], ['Centro', 'Bairro Piauí', 'Fonte dos Matos']);
  assert.equal(normalizeNeighborhood('  Morro   da Saudade '), 'Morro da Saudade');
  assert.match(validateNeighborhood('   '), /Escolha ou digite/);
  assert.match(validateNeighborhood('A'), /2 letras/);
  assert.match(validateNeighborhood('x'.repeat(61)), /60 caracteres/);
  assert.equal(validateNeighborhood('Centro'), undefined);
});

test('Supabase: perfil lê e grava só o bairro, e traduz a tabela ausente', async () => {
  const calls = [];
  const query = (result) => ({
    select: (columns) => (calls.push(['select', columns]), query(result)),
    maybeSingle: () => Promise.resolve(result),
    upsert: (row, options) => (calls.push(['upsert', row, options]), Promise.resolve(result)),
  });
  const client = (result) => ({ from: (table) => (calls.push(['from', table]), query(result)) });

  const vazio = createSupabaseProfileRepository(client({ data: null, error: null }));
  assert.deepEqual(await vazio.getProfile(), { neighborhood: null, city: 'Piripiri' });
  await vazio.setNeighborhood('Centro');
  assert.deepEqual(calls.at(-1), ['upsert', { neighborhood: 'Centro' }, { onConflict: 'user_id' }]);

  const semTabela = createSupabaseProfileRepository(
    client({ data: null, error: { code: 'PGRST205', message: 'not found' } }),
  );
  await assert.rejects(semTabela.getProfile(), { code: 'not_configured' });
  assert.equal(mapSupabaseProfileError({ message: 'Failed to fetch' }).code, 'network');
  await assert.rejects(createSupabaseProfileRepository(null).getProfile(), {
    code: 'not_configured',
  });
});

test('Seu bairro: escolhe da lista ou digita outro e grava no perfil', async () => {
  const memory = createMemoryProfileRepository();
  let saved = 0;
  const hook = await renderHook(() =>
    useNeighborhoodViewModel(memory.repository, { onSaved: () => (saved += 1) }),
  );
  assert.equal(hook.vm.status, 'ready');
  assert.equal(hook.vm.choice, null);

  await act(async () => hook.vm.save());
  assert.match(hook.vm.error, /Escolha ou digite/);
  assert.equal(saved, 0);

  await act(async () => hook.vm.choose('Fonte dos Matos'));
  await act(async () => hook.vm.save());
  assert.equal(memory.current().neighborhood, 'Fonte dos Matos');
  assert.equal(saved, 1);

  await act(async () => hook.vm.choose('other'));
  assert.equal(hook.vm.text, '', 'outro bairro começa vazio');
  await act(async () => hook.vm.setText('  Morro da Saudade '));
  await act(async () => hook.vm.save());
  assert.equal(memory.current().neighborhood, 'Morro da Saudade');
  await hook.unmount();
});

test('Escolher bairro: carrega o bairro salvo, mostra erro de carga e de gravação', async () => {
  const memory = createMemoryProfileRepository({ neighborhood: 'Morro da Saudade' });
  const hook = await renderHook(() =>
    useNeighborhoodViewModel(memory.repository, { onSaved: () => {} }),
  );
  assert.equal(hook.vm.choice, 'other');
  assert.equal(hook.vm.value, 'Morro da Saudade');
  assert.equal(hook.vm.city, 'Piripiri, PI');

  memory.fail(new ProfileError('network'));
  await act(async () => hook.vm.setText('Centro'));
  await act(async () => hook.vm.save());
  assert.match(hook.vm.error, /internet/);
  await act(async () => hook.vm.retry());
  assert.equal(hook.vm.status, 'error');
  assert.match(hook.vm.loadError, /internet/);

  memory.fail(null);
  await act(async () => hook.vm.retry());
  assert.equal(hook.vm.status, 'ready');
  await hook.unmount();
});

test('localização: bairro só de endereços em Piripiri (11.02)', () => {
  assert.equal(
    neighborhoodFromAddress({ city: 'Piripiri', district: ' Fonte  dos Matos ' }),
    'Fonte dos Matos',
  );
  assert.equal(neighborhoodFromAddress({ city: 'PIRIPIRÍ', district: 'Centro' }), 'Centro');
  assert.throws(() => neighborhoodFromAddress({ city: 'Teresina', district: 'Centro' }), {
    code: 'outside_city',
  });
  assert.throws(() => neighborhoodFromAddress({ city: null, district: 'Centro' }), {
    code: 'outside_city',
  });
  assert.throws(() => neighborhoodFromAddress({ city: 'Piripiri', district: null }), {
    code: 'not_found',
  });
});

test('Permitir localização: preenche o bairro ou explica por que não deu', async () => {
  let answer = Promise.reject(new LocationError('denied'));
  answer.catch(() => {});
  const locator = { currentAddress: () => answer };
  const found = [];
  const hook = await renderHook(() =>
    useLocateNeighborhoodViewModel(locator, { onFound: (name) => found.push(name) }),
  );
  await act(async () => hook.vm.locate());
  assert.match(hook.vm.error, /permissão/);

  answer = Promise.resolve({ city: 'Teresina', district: 'Centro' });
  await act(async () => hook.vm.locate());
  assert.match(hook.vm.error, /fora de Piripiri/);

  answer = Promise.reject(new Error('GPS desligado'));
  answer.catch(() => {});
  await act(async () => hook.vm.locate());
  assert.match(hook.vm.error, /obter sua localização/);

  answer = Promise.resolve({ city: 'Piripiri', district: 'Bairro Piauí' });
  await act(async () => hook.vm.locate());
  assert.equal(hook.vm.error, undefined);
  assert.deepEqual(found, ['Bairro Piauí']);
  await hook.unmount();
});

test('Escolher bairro: o bairro achado pela localização preenche o campo', async () => {
  const memory = createMemoryProfileRepository({ neighborhood: 'Centro' });
  const hook = await renderHook(() =>
    useNeighborhoodViewModel(memory.repository, { onSaved: () => {}, prefill: 'Morro da Saudade' }),
  );
  assert.equal(hook.vm.value, 'Morro da Saudade');
  assert.equal(memory.current().neighborhood, 'Centro', 'só grava ao salvar');
  await act(async () => hook.vm.save());
  assert.equal(memory.current().neighborhood, 'Morro da Saudade');
  await hook.unmount();
});
