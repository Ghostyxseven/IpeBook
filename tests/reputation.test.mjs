import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ReputationError } from '../src/model/entities/Rating.ts';
import { createMemoryReputationRepository } from '../src/model/repositories/memoryReputationRepository.ts';
import { mapSupabaseReputationError } from '../src/model/repositories/supabaseReputationRepository.ts';
import { helpTopics } from '../src/model/services/helpTopics.ts';
import {
  ANONYMOUS,
  averageLabel,
  completedLabel,
  historyLine,
  initials,
  memberSinceLabel,
  personName,
  ratingLabel,
  reputationLine,
} from '../src/model/services/reputationFormat.ts';
import {
  useCompletionRatingViewModel,
  useHistoryViewModel,
  usePublicProfileViewModel,
  useRatingsReceivedViewModel,
} from '../src/viewmodel/useReputationViewModels.ts';

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

const ana = {
  userId: 'ana',
  firstName: 'Ana Paula',
  memberSince: '2024-03-10T12:00:00Z',
  completedCount: 8,
  ratingAverage: 4.8,
  ratingCount: 3,
};

const novata = {
  userId: 'novata',
  firstName: 'Bruna',
  memberSince: '2026-10-01T12:00:00Z',
  completedCount: 0,
  ratingAverage: null,
  ratingCount: 0,
};

// ── Formatação: o que a tela mostra ─────────────────────────────────────────

test('média aparece como no Figma, e quem não tem nota não tem média', () => {
  assert.equal(averageLabel(4.8), '4,8 de 5');
  assert.equal(averageLabel(5), '5,0 de 5');
  // O ponto da decisão: `null`, nunca "0,0 de 5" — zero numa escala de 1 a 5 é
  // uma nota ruim dada a quem nunca fez nada de errado (ADR 0027).
  assert.equal(averageLabel(null), null);
  assert.equal(averageLabel(undefined), null);
});

test('a contagem de trocas concorda em número e não mostra zero como conquista', () => {
  assert.equal(completedLabel(8), '8 trocas concluídas');
  assert.equal(completedLabel(1), '1 troca concluída');
  assert.equal(completedLabel(0), 'Nenhuma troca concluída ainda');
  assert.equal(completedLabel(-1), 'Nenhuma troca concluída ainda');
});

test('a linha do histórico na comunidade junta os dois dados, com e sem nota', () => {
  assert.equal(reputationLine(ana), '8 trocas concluídas · avaliação 4,8 de 5');
  assert.equal(reputationLine(novata), 'Nenhuma troca concluída ainda · ainda sem avaliações');
});

test('o monograma do avatar usa duas letras, e cai no ícone sem nome', () => {
  assert.equal(initials('Ana Paula'), 'AP');
  assert.equal(initials('Bruno'), 'BR');
  assert.equal(initials('  maria  da  silva '), 'MS', 'primeira e última, sem os espaços');
  assert.equal(initials(null), null);
  assert.equal(initials('   '), null);
});

test('quem não tem nome cadastrado ainda é chamado de alguma coisa', () => {
  assert.equal(personName('Ana'), 'Ana');
  assert.equal(personName(null), ANONYMOUS);
  assert.equal(personName('  '), ANONYMOUS);
});

test('"desde" mostra só o ano: mês e dia não ajudam e expõem mais', () => {
  assert.equal(memberSinceLabel('2024-03-10T12:00:00Z'), 'Na comunidade desde 2024');
  assert.equal(memberSinceLabel('não é data'), null);
});

test('o rótulo da avaliação traz quem escreveu e a nota', () => {
  assert.equal(
    ratingLabel({ id: '1', authorFirstName: 'Ana Paula', score: 5, comment: null, createdAt: '' }),
    'Ana Paula · 5 de 5',
  );
  assert.equal(
    ratingLabel({ id: '2', authorFirstName: null, score: 4, comment: null, createdAt: '' }),
    `${ANONYMOUS} · 4 de 5`,
  );
});

test('o verbo do histórico muda conforme o lado em que a pessoa estava', () => {
  const base = {
    requestId: 'r1',
    listingId: 'l1',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    otherPersonId: 'ana',
    otherFirstName: 'Ana Paula',
    rated: false,
    completedAt: '2026-10-01T12:00:00Z',
  };
  assert.equal(
    historyLine({ ...base, modality: 'sale', iWasOwner: true }),
    'Vendido para Ana Paula',
  );
  assert.equal(
    historyLine({ ...base, modality: 'sale', iWasOwner: false }),
    'Comprado de Ana Paula',
  );
  assert.equal(
    historyLine({ ...base, modality: 'donation', iWasOwner: true }),
    'Doado para Ana Paula',
  );
  assert.equal(
    historyLine({ ...base, modality: 'donation', iWasOwner: false }),
    'Recebido de Ana Paula',
  );
  assert.equal(
    historyLine({ ...base, modality: 'trade', iWasOwner: true }),
    'Trocado com Ana Paula',
  );
});

test('a Ajuda tem os três tópicos do quadro 09.01', () => {
  assert.equal(helpTopics.length, 3);
  assert.deepEqual(
    helpTopics.map((topic) => topic.question),
    ['Como funciona a troca?', 'Onde acontece a entrega?', 'Algo não saiu como combinado?'],
  );
  for (const topic of helpTopics) assert.ok(topic.answer.length > 20, topic.id);
});

// ── Erros do Supabase viram códigos do app ──────────────────────────────────

test('migração ausente é "não configurado", e recusa da RLS é "não permitido"', () => {
  assert.equal(mapSupabaseReputationError({ code: 'PGRST202' }).code, 'not_configured');
  assert.equal(mapSupabaseReputationError({ code: '42P01' }).code, 'not_configured');
  assert.equal(mapSupabaseReputationError({ code: '42501' }).code, 'not_allowed');
  // 23505: a `unique (request_id, author_id)` barrou a segunda avaliação.
  assert.equal(mapSupabaseReputationError({ code: '23505' }).code, 'not_allowed');
  assert.equal(mapSupabaseReputationError({ message: 'Failed to fetch' }).code, 'network');
  assert.equal(mapSupabaseReputationError({}).code, 'unknown');
});

// ── ViewModels ──────────────────────────────────────────────────────────────

test('o perfil de outra pessoa carrega e expõe só o que a tela mostra', async () => {
  const repository = createMemoryReputationRepository({ profiles: [ana] });
  const screen = await renderHook(() => usePublicProfileViewModel(repository, 'ana'));
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.profile.firstName, 'Ana Paula');
  assert.deepEqual(
    Object.keys(screen.vm.profile).sort(),
    ['completedCount', 'firstName', 'memberSince', 'ratingAverage', 'ratingCount', 'userId'],
    'nenhum campo a mais: nada de e-mail nem bairro',
  );
  await screen.unmount();
});

test('perfil que não existe mostra erro com "tentar de novo"', async () => {
  const repository = createMemoryReputationRepository({ profiles: [ana] });
  const screen = await renderHook(() => usePublicProfileViewModel(repository, 'ninguem'));
  assert.equal(screen.vm.status, 'error');
  assert.match(screen.vm.error, /Não encontramos/);
  await screen.unmount();
});

test('sem a migração aplicada, a mensagem diz isso em português', async () => {
  const repository = createMemoryReputationRepository({
    failWith: new ReputationError('not_configured'),
  });
  const screen = await renderHook(() => usePublicProfileViewModel(repository, 'ana'));
  assert.equal(screen.vm.status, 'error');
  assert.match(screen.vm.error, /ainda não foram configuradas/);
  await screen.unmount();
});

test('avaliações recebidas trazem o perfil e a lista juntos', async () => {
  const repository = createMemoryReputationRepository({
    profiles: [ana],
    ratings: {
      ana: [
        {
          id: 'a1',
          authorFirstName: 'Bruno',
          score: 5,
          comment: 'Livro bem conservado.',
          createdAt: '2026-10-01T12:00:00Z',
        },
      ],
    },
  });
  const screen = await renderHook(() => useRatingsReceivedViewModel(repository, 'ana'));
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.ratings.length, 1);
  assert.equal(averageLabel(screen.vm.profile.ratingAverage), '4,8 de 5');
  await screen.unmount();
});

test('perfil novo fica pronto com lista vazia e sem média', async () => {
  const repository = createMemoryReputationRepository({ profiles: [novata] });
  const screen = await renderHook(() => useRatingsReceivedViewModel(repository, 'novata'));
  assert.equal(screen.vm.status, 'ready');
  assert.deepEqual(screen.vm.ratings, []);
  assert.equal(averageLabel(screen.vm.profile.ratingAverage), null);
  await screen.unmount();
});

const concluida = {
  requestId: 'r1',
  listingId: 'l1',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  modality: 'trade',
  otherPersonId: 'ana',
  otherFirstName: 'Ana Paula',
  iWasOwner: true,
  rated: false,
  completedAt: '2026-10-01T12:00:00Z',
};

test('o histórico lista as concluídas e deixa avaliar uma vez', async () => {
  const repository = createMemoryReputationRepository({ history: [concluida] });
  const screen = await renderHook(() => useHistoryViewModel(repository));
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.history.length, 1);

  await act(async () => screen.vm.rate(concluida, 5, 'Tudo combinado com clareza.'));
  assert.deepEqual(repository.rated, [{ requestId: 'r1', subjectId: 'ana', score: 5 }]);
  assert.equal(screen.vm.actionError, null);

  // A segunda tentativa é recusada, como a `unique` do banco recusaria.
  await act(async () => screen.vm.rate(concluida, 1, null));
  assert.match(screen.vm.actionError, /concluíram/);
  assert.equal(repository.rated.length, 1);
  await screen.unmount();
});

test('negociação com pessoa que excluiu a conta não tenta avaliar ninguém', async () => {
  const semPessoa = { ...concluida, otherPersonId: null, otherFirstName: null };
  const repository = createMemoryReputationRepository({ history: [semPessoa] });
  const screen = await renderHook(() => useHistoryViewModel(repository));
  await act(async () => screen.vm.rate(semPessoa, 5, null));
  assert.deepEqual(repository.rated, []);
  await screen.unmount();
});

test('histórico vazio fica pronto, não em erro', async () => {
  const repository = createMemoryReputationRepository({ history: [] });
  const screen = await renderHook(() => useHistoryViewModel(repository));
  assert.equal(screen.vm.status, 'ready');
  assert.deepEqual(screen.vm.history, []);
  await screen.unmount();
});

test('avaliar no fim da negociação só aparece para quem ainda não avaliou', async () => {
  const repository = createMemoryReputationRepository({ history: [concluida] });
  const screen = await renderHook(() => useCompletionRatingViewModel(repository, 'r1'));
  assert.equal(screen.vm.status, 'ready');
  assert.equal(screen.vm.canRate, true);
  assert.equal(screen.vm.otherFirstName, 'Ana Paula');

  await act(async () => screen.vm.rate(4, 'Encontro tranquilo.'));
  assert.deepEqual(repository.rated, [{ requestId: 'r1', subjectId: 'ana', score: 4 }]);
  // Some da tela sem recarregar o histórico inteiro.
  assert.equal(screen.vm.justRated, true);
  assert.equal(screen.vm.canRate, false);
  assert.equal(screen.vm.error, null);
  await screen.unmount();
});

test('quem já avaliou, ou negociação de outra pessoa, não recebe o convite', async () => {
  // O repositório fica FORA do `renderHook`: criá-lo dentro muda a dependência a cada
  // render e o carregamento nunca para.
  const avaliado = createMemoryReputationRepository({
    history: [{ ...concluida, rated: true }],
  });
  const comAvaliacao = await renderHook(() => useCompletionRatingViewModel(avaliado, 'r1'));
  assert.equal(comAvaliacao.vm.canRate, false, 'uma avaliação por negociação (ADR 0027)');
  await comAvaliacao.unmount();

  // A negociação aberta na tela não está no histórico: nada a avaliar ainda.
  const semEntrada = createMemoryReputationRepository({ history: [concluida] });
  const outra = await renderHook(() => useCompletionRatingViewModel(semEntrada, 'r9'));
  assert.equal(outra.vm.canRate, false);
  assert.equal(outra.vm.otherFirstName, null);
  await outra.unmount();

  // Conta da outra pessoa excluída: não há a quem avaliar.
  const semPessoa = createMemoryReputationRepository({
    history: [{ ...concluida, otherPersonId: null, otherFirstName: null }],
  });
  const semOutro = await renderHook(() => useCompletionRatingViewModel(semPessoa, 'r1'));
  assert.equal(semOutro.vm.canRate, false);
  await semOutro.unmount();
});

test('falha ao avaliar no fim da negociação vira mensagem, sem travar a tela', async () => {
  const repository = createMemoryReputationRepository({ history: [concluida] });
  const screen = await renderHook(() => useCompletionRatingViewModel(repository, 'r1'));
  await act(async () => screen.vm.rate(5, null));
  // A segunda tentativa é recusada, como a `unique` do banco recusaria.
  await act(async () => screen.vm.rate(1, null));
  assert.equal(repository.rated.length, 1);
  await screen.unmount();
});
