import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BookLookupError } from '../src/model/entities/BookLookup.ts';
import { createMemoryBookLookupRepository } from '../src/model/repositories/memoryBookLookupRepository.ts';
import { createOpenLibraryBookLookupRepository } from '../src/model/repositories/openLibraryBookLookupRepository.ts';
import { fillFromLookup } from '../src/model/services/bookLookup.ts';
import { isBooklandEan, isValidIsbn, normalizeIsbn, toIsbn13 } from '../src/model/services/isbn.ts';
import { useIsbnScanViewModel } from '../src/viewmodel/useIsbnScanViewModel.ts';

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

/** O Pequeno Príncipe (Agir), usado no quadro 04.03 do Figma. */
const PRINCIPE = {
  isbn: '9788522005475',
  title: 'O Pequeno Príncipe',
  author: 'Antoine de Saint-Exupéry',
};

// ── ISBN: dígito verificador, sem rede ──────────────────────────────────────

test('normalizar tira hífen, espaço e ponto e põe o X em maiúscula', () => {
  assert.equal(normalizeIsbn('978-85-220-0547-5'), '9788522005475');
  assert.equal(normalizeIsbn(' 85 359 0277 x '), '853590277X');
});

test('ISBN-13 válido passa e um dígito trocado é recusado', () => {
  assert.ok(isValidIsbn('9788522005475'));
  assert.ok(isValidIsbn('978-85-220-0547-5'), 'hífen não muda o resultado');
  assert.ok(!isValidIsbn('9788522005473'), 'dígito verificador errado');
  assert.ok(!isValidIsbn('978852200547'), 'doze dígitos não são ISBN-13');
});

test('ISBN-10 válido passa, inclusive com X no fim', () => {
  assert.ok(isValidIsbn('8535902775'));
  assert.ok(isValidIsbn('043942089X'), 'o X vale 10');
  assert.ok(!isValidIsbn('8535902776'));
});

test('só EAN-13 de livro (978 e 979) vale como código de barras', () => {
  assert.ok(isBooklandEan('9788522005475'));
  assert.ok(!isBooklandEan('7891000100103'), 'código de barras de produto comum');
  assert.ok(!isBooklandEan('8535902775'), 'ISBN-10 não é EAN-13');
});

test('ISBN-10 vira ISBN-13 com dígito verificador novo; código torto vira null', () => {
  assert.equal(toIsbn13('8535902775'), '9788535902778');
  assert.equal(toIsbn13('9788522005475'), '9788522005475', 'já é 13, fica igual');
  assert.equal(toIsbn13('9788522005473'), null);
});

// ── Consulta ────────────────────────────────────────────────────────────────

test('código torto não vira requisição', async () => {
  const repository = createMemoryBookLookupRepository([PRINCIPE]);
  await assert.rejects(
    () => repository.findByIsbn('9788522005473'),
    (error) => error instanceof BookLookupError && error.code === 'invalid_isbn',
  );
  assert.deepEqual(repository.calls, [], 'nenhuma consulta foi feita');
});

test('a consulta busca pelo ISBN-13, mesmo quando a pessoa digitou o ISBN-10', async () => {
  const repository = createMemoryBookLookupRepository([
    { isbn: '9788535902778', title: 'Vidas Secas', author: 'Graciliano Ramos' },
  ]);
  const book = await repository.findByIsbn('85-359-0277-5');
  assert.equal(book.title, 'Vidas Secas');
  assert.deepEqual(repository.calls, ['9788535902778']);
});

test('a Open Library valida antes de abrir a rede', async () => {
  let chamou = false;
  const repository = createOpenLibraryBookLookupRepository(async () => {
    chamou = true;
    throw new Error('não deveria ter chamado');
  });
  await assert.rejects(
    () => repository.findByIsbn('9788522005473'),
    (error) => error.code === 'invalid_isbn',
  );
  assert.equal(chamou, false);
});

test('resposta vazia da Open Library é "não encontrado", não erro de rede', async () => {
  const repository = createOpenLibraryBookLookupRepository(async () => ({
    ok: true,
    json: async () => ({}),
  }));
  await assert.rejects(
    () => repository.findByIsbn('9788522005475'),
    (error) => error.code === 'not_found',
  );
});

test('a Open Library junta os autores e devolve o ISBN-13 normalizado', async () => {
  const repository = createOpenLibraryBookLookupRepository(async () => ({
    ok: true,
    json: async () => ({
      'ISBN:9788522005475': {
        title: 'O Pequeno Príncipe',
        authors: [{ name: 'Antoine de Saint-Exupéry' }, { name: 'Dom Marcos Barbosa' }],
      },
    }),
  }));
  const book = await repository.findByIsbn('978-85-220-0547-5');
  assert.equal(book.isbn, '9788522005475');
  assert.equal(book.author, 'Antoine de Saint-Exupéry, Dom Marcos Barbosa');
});

test('falha de rede vira network, não unknown', async () => {
  const repository = createOpenLibraryBookLookupRepository(async () => {
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(
    () => repository.findByIsbn('9788522005475'),
    (error) => error.code === 'network',
  );
});

// ── ViewModel ───────────────────────────────────────────────────────────────

test('ler um código de livro encontra e mostra o livro', async () => {
  const repository = createMemoryBookLookupRepository([PRINCIPE]);
  const screen = await renderHook(() => useIsbnScanViewModel(repository));
  assert.equal(screen.vm.status, 'scanning');
  await act(async () => screen.vm.onBarcode('9788522005475'));
  assert.equal(screen.vm.status, 'found');
  assert.equal(screen.vm.book.title, 'O Pequeno Príncipe');
  assert.equal(screen.vm.code, '9788522005475');
  await screen.unmount();
});

test('código de barras que não é de livro é ignorado pela câmera', async () => {
  const repository = createMemoryBookLookupRepository([PRINCIPE]);
  const screen = await renderHook(() => useIsbnScanViewModel(repository));
  await act(async () => screen.vm.onBarcode('7891000100103'));
  assert.equal(screen.vm.status, 'scanning', 'continua lendo');
  assert.deepEqual(repository.calls, []);
  await screen.unmount();
});

test('ISBN válido que a base não conhece leva ao quadro 04.18, com o código no campo', async () => {
  const repository = createMemoryBookLookupRepository([]);
  const screen = await renderHook(() => useIsbnScanViewModel(repository));
  await act(async () => screen.vm.onBarcode('9788522005475'));
  assert.equal(screen.vm.status, 'not-found');
  assert.equal(screen.vm.code, '9788522005475', 'o código fica no campo para corrigir');
  assert.match(screen.vm.error, /Confira o código/);
  await screen.unmount();
});

test('falha de rede mostra mensagem em português e deixa tentar de novo', async () => {
  const repository = createMemoryBookLookupRepository([PRINCIPE], {
    failWith: new BookLookupError('network'),
  });
  const screen = await renderHook(() => useIsbnScanViewModel(repository));
  await act(async () => screen.vm.onBarcode('9788522005475'));
  assert.equal(screen.vm.status, 'not-found');
  assert.match(screen.vm.error, /internet/);
  await act(async () => screen.vm.scanAgain());
  assert.equal(screen.vm.status, 'scanning');
  assert.equal(screen.vm.error, null);
  await screen.unmount();
});

test('digitar o ISBN alcança o mesmo resultado, sem câmera', async () => {
  const repository = createMemoryBookLookupRepository([PRINCIPE]);
  const screen = await renderHook(() => useIsbnScanViewModel(repository));
  await act(async () => screen.vm.typeManually());
  assert.equal(screen.vm.status, 'typing');
  await act(async () => screen.vm.submitTyped());
  assert.equal(screen.vm.status, 'typing', 'campo vazio não consulta');
  await act(async () => screen.vm.setCode('978-85-220-0547-5'));
  await act(async () => screen.vm.submitTyped());
  assert.equal(screen.vm.status, 'found');
  await screen.unmount();
});

test('câmera negada leva ao quadro 04.17 e não atropela um resultado já na tela', async () => {
  const repository = createMemoryBookLookupRepository([PRINCIPE]);
  const screen = await renderHook(() => useIsbnScanViewModel(repository));
  await act(async () => screen.vm.cameraDenied());
  assert.equal(screen.vm.status, 'denied');
  await act(async () => screen.vm.typeManually());
  await act(async () => screen.vm.cameraDenied());
  assert.equal(screen.vm.status, 'typing', 'quem já está digitando não volta para o aviso');
  await screen.unmount();
});

// ── Aplicar no formulário ───────────────────────────────────────────────────

const draft = (extra = {}) => ({
  title: '',
  author: '',
  category: '',
  modality: 'sale',
  priceCents: null,
  tradeTerms: null,
  condition: 'bom',
  neighborhood: null,
  city: 'Piripiri',
  description: null,
  ...extra,
});

test('a leitura preenche o que está vazio e não encosta no que foi digitado', () => {
  assert.deepEqual(
    fillFromLookup(draft(), PRINCIPE),
    draft({ title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry' }),
  );

  const meu = fillFromLookup(draft({ title: 'O Pequeno Príncipe (edição de bolso)' }), PRINCIPE);
  assert.equal(meu.title, 'O Pequeno Príncipe (edição de bolso)', 'o que a pessoa escreveu manda');
  assert.equal(meu.author, 'Antoine de Saint-Exupéry', 'o campo vazio foi preenchido');

  const soEspaco = fillFromLookup(draft({ title: '   ' }), PRINCIPE);
  assert.equal(soEspaco.title, 'O Pequeno Príncipe', 'espaço em branco não é escolha');
});
