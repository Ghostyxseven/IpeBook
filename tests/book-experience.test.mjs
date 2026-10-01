import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bookExamples,
  exampleTerms,
  filterBookExamples,
} from '../src/model/services/bookExperience.ts';

test('busca por título ou categoria ignora acentos, espaços e caixa', () => {
  assert.equal(filterBookExamples('  JARDIM  ', 'Todos')[0].id, 'jardim');
  assert.equal(filterBookExamples('infantil', 'Todos')[0].id, 'quintal');
  assert.equal(filterBookExamples('caminhos', 'Venda').length, 0);
  assert.equal(filterBookExamples('inexistente', 'Todos').length, 0);
  assert.equal(filterBookExamples('', 'Todos').length, 6);
});

test('preço só pertence à venda; doação e troca mantêm seus significados', () => {
  assert.match(exampleTerms(bookExamples[0]), /R\$\s28,00/);
  assert.equal(exampleTerms(bookExamples[1]), 'Troca por outra leitura');
  assert.equal(exampleTerms(bookExamples[2]), 'Grátis');
  for (const example of bookExamples.filter((book) => book.modality !== 'Venda'))
    assert.equal('price' in example, false);
  assert.match(bookExamples[1].interest, /Contos ou poesia/);
});
