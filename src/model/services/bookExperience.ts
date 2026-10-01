import type { BookExample, ExampleFilter, ReaderGuide } from '../entities/BookExperience';

export const readerGuides: ReaderGuide[] = [
  {
    id: 'comprar',
    label: 'Comprar',
    title: 'Sua próxima leitura pode estar por perto.',
    intro:
      'A proposta é descobrir exemplares à venda na comunidade e combinar a compra diretamente com quem anuncia.',
    steps: [
      {
        title: 'Encontre seu livro',
        description: 'Procure pelo título ou tema e escolha a modalidade Venda.',
      },
      {
        title: 'Conheça o exemplar',
        description:
          'Confira edição, fotos, conservação e preço em reais. Tire suas dúvidas antes de combinar.',
      },
      {
        title: 'Combine a entrega',
        description:
          'Acerte local e condições com a pessoa. Confira o livro presencialmente antes de concluir.',
      },
    ],
    checklist: [
      'Título e edição são os que você procura?',
      'O estado do livro atende ao que você espera?',
      'Preço e condições da entrega estão claros?',
    ],
    note: 'As compras ainda não estão disponíveis. Esta apresentação não recebe pedidos nem processa pagamentos.',
  },
  {
    id: 'vender',
    label: 'Vender',
    title: 'Abra espaço para o próximo capítulo.',
    intro:
      'Um anúncio claro ajuda outro leitor a escolher. Veja o que preparar para quando os anúncios estiverem disponíveis.',
    steps: [
      {
        title: 'Apresente o exemplar',
        description: 'Separe título, autor, edição e fotos da capa, lombada e páginas.',
      },
      {
        title: 'Defina um preço',
        description:
          'Informe o valor em reais e descreva marcas, anotações ou desgaste com transparência.',
      },
      {
        title: 'Converse e combine',
        description: 'Responda às dúvidas e acerte uma entrega presencial em local público.',
      },
    ],
    checklist: [
      'Fotos mostram o livro que será entregue?',
      'Anotações e avarias foram descritas?',
      'O preço em reais está fácil de entender?',
    ],
    note: 'Publicar anúncios e conversar com compradores são recursos planejados, ainda indisponíveis.',
  },
  {
    id: 'trocar',
    label: 'Trocar',
    title: 'Uma leitura termina. Outra começa.',
    intro:
      'A troca nasce de um acordo: você oferece um exemplar e conta quais leituras gostaria de receber.',
    steps: [
      {
        title: 'Mostre o que oferece',
        description: 'Descreva o livro e sua conservação, como faria em qualquer anúncio.',
      },
      {
        title: 'Conte o que procura',
        description: 'Indique títulos, autores ou gêneros. Diga se aceita outras sugestões.',
      },
      {
        title: 'Confira os dois livros',
        description: 'Confirmem o interesse e o estado dos exemplares antes de fazer a troca.',
      },
    ],
    checklist: [
      'O interesse de troca está descrito?',
      'As duas pessoas concordam com os exemplares?',
      'Local e horário foram combinados?',
    ],
    note: 'Troca não tem preço de venda. Os termos dependem do acordo entre leitores; não há troca ativa nesta versão.',
  },
  {
    id: 'doar',
    label: 'Doar',
    title: 'Um livro seu. Um começo para alguém.',
    intro:
      'Doar é oferecer gratuitamente um exemplar em condições de leitura e combinar como ele chegará à outra pessoa.',
    steps: [
      {
        title: 'Escolha um livro',
        description: 'Veja se está completo e em condições de ser lido por outra pessoa.',
      },
      {
        title: 'Marque como doação',
        description: 'Descreva o estado com clareza. Doação é gratuita, sem preço de venda.',
      },
      {
        title: 'Combine a retirada',
        description: 'Acertem um local público e um horário que funcione para as duas pessoas.',
      },
    ],
    checklist: [
      'O exemplar está completo e legível?',
      'A gratuidade está explícita?',
      'A pessoa sabe como será a retirada?',
    ],
    note: 'As doações ainda não podem ser anunciadas. Este guia explica a experiência que queremos construir.',
  },
];

// Títulos, condições e preços criados para demonstrar a interface. Não são anúncios reais.
export const bookExamples: BookExample[] = [
  {
    id: 'jardim',
    title: 'O jardim das palavras',
    category: 'Romance',
    modality: 'Venda',
    price: 28,
    cover: 'forest',
    description: 'Uma história fictícia sobre encontros, cartas e recomeços em uma pequena cidade.',
    condition: 'Exemplo: bom estado, com pequenas marcas na capa e páginas sem anotações.',
  },
  {
    id: 'caminhos',
    title: 'Caminhos de sol',
    category: 'Contos',
    modality: 'Troca',
    interest: 'Contos ou poesia; aberto a sugestões.',
    cover: 'sun',
    description: 'Uma coletânea fictícia de encontros e descobertas pelo interior.',
    condition: 'Exemplo: páginas completas, com dedicatória na primeira folha.',
  },
  {
    id: 'quintal',
    title: 'Um mundo no quintal',
    category: 'Infantil',
    modality: 'Doação',
    cover: 'clay',
    description:
      'Uma aventura fictícia sobre observar a natureza e inventar histórias perto de casa.',
    condition: 'Exemplo: marcas de uso na lombada, com todas as páginas legíveis.',
  },
  {
    id: 'ventania',
    title: 'Cartas ao vento',
    category: 'Poesia',
    modality: 'Venda',
    price: 18,
    cover: 'sun',
    description: 'Uma coletânea fictícia de poemas curtos sobre distância e saudade.',
    condition: 'Exemplo: bom estado, com uma página dobrada no canto.',
  },
  {
    id: 'rio',
    title: 'O rio que lembra',
    category: 'Aventura',
    modality: 'Troca',
    interest: 'Romances ou ficção científica; aberto a sugestões.',
    cover: 'forest',
    description: 'Uma aventura fictícia de dois irmãos que seguem um rio até a nascente.',
    condition: 'Exemplo: lombada firme, sem anotações.',
  },
  {
    id: 'nuvens',
    title: 'Nuvens de papel',
    category: 'Infantil',
    modality: 'Doação',
    cover: 'sun',
    description: 'Uma história fictícia sobre dobraduras que ganham vida à tarde.',
    condition: 'Exemplo: páginas completas, com leves marcas de uso.',
  },
];

export function filterBookExamples(query: string, filter: ExampleFilter): BookExample[] {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  const term = normalize(query.trim());
  return bookExamples.filter(
    (book) =>
      (filter === 'Todos' || book.modality === filter) &&
      normalize(`${book.title} ${book.category}`).includes(term),
  );
}

export function exampleTerms(book: BookExample): string {
  if (book.modality === 'Venda')
    return book.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (book.modality === 'Troca') return 'Troca por outra leitura';
  return 'Grátis';
}
