import type { LegalDocument, LegalPage, Page } from '../entities/Institutional';

export function resolvePage(hash: string): Page {
  const page = hash.replace(/^#/, '');
  return page === 'termos' || page === 'privacidade' || page === 'lgpd' ? page : 'inicio';
}

export const legalLinks = [
  { id: 'termos', label: 'Termos de Uso' },
  { id: 'privacidade', label: 'Privacidade' },
  { id: 'lgpd', label: 'Seus direitos e LGPD' },
] as const;

export const documents: Record<LegalPage, LegalDocument> = {
  termos: {
    title: 'Termos de Uso',
    intro: 'Conheça a proposta do IpêBook e as condições desta página de apresentação.',
    sections: [
      {
        title: 'Sobre esta versão',
        paragraphs: [
          'O IpêBook é um projeto de conexão entre pessoas para compra, troca e doação de livros em Piripiri, Piauí. Esta versão é uma apresentação: não permite criar contas, publicar anúncios, negociar, enviar mensagens ou efetuar pagamentos.',
          'Os botões de acesso informam que o aplicativo ainda está em preparação. As composições de livros são ilustrações, não anúncios disponíveis.',
        ],
      },
      {
        title: 'Uso da página',
        paragraphs: [
          'Você pode consultar a apresentação e os documentos sem cadastro. Não use a página para atividades ilícitas, tentativas de invasão ou interferência no acesso de outras pessoas. A simples navegação não representa consentimento para finalidades futuras de tratamento de dados.',
        ],
      },
      {
        title: 'Compra, troca e doação',
        paragraphs: [
          'A proposta futura prevê venda com preço informado em reais, troca conforme acordo entre pessoas e doação gratuita. As condições de conservação, entrega e eventual pagamento deverão ser esclarecidas antes de qualquer acordo.',
          'Esses fluxos ainda não estão disponíveis. Regras operacionais, responsabilidades, atendimento e eventuais condições comerciais serão informados antes do lançamento. Esta apresentação não oferece garantia de disponibilidade de exemplares nem processa transações.',
        ],
      },
      {
        title: 'Conteúdo e direitos',
        paragraphs: [
          'Respeite direitos autorais, privacidade e a legislação aplicável. A apresentação não autoriza a distribuição de cópias não autorizadas de obras. Os direitos de quem utiliza o serviço, inclusive direitos do consumidor quando aplicáveis, não são afastados por este documento.',
        ],
      },
      {
        title: 'Atualizações e responsável',
        paragraphs: [
          'Esta é uma versão preliminar, datada de 29 de setembro de 2026. A identificação do responsável e o canal oficial de atendimento ainda não foram informados. Antes da operação do serviço, os termos deverão ser revisados e complementados com essas informações.',
          'Mudanças serão publicadas nesta página com a data de revisão. Não há aceite contratual ou cadastro sendo coletado nesta versão.',
        ],
      },
    ],
  },
  privacidade: {
    title: 'Política de Privacidade',
    intro: 'Transparência sobre o que esta apresentação faz e o que ainda precisa ser definido.',
    sections: [
      {
        title: 'Escopo e responsável',
        paragraphs: [
          'Este aviso descreve apenas a página institucional atual do IpêBook. A identificação do controlador e seu canal de contato ainda estão pendentes. Por isso, este documento é preliminar e deverá ser complementado antes da operação do aplicativo.',
        ],
      },
      {
        title: 'Dados nesta apresentação',
        paragraphs: [
          'Esta página não tem formulários de cadastro ou contato e não solicita nome, e-mail, senha, localização precisa ou dados de pagamento. Abrir menus, perguntas e documentos não envia essas ações a um serviço de análise.',
          'A entrega de uma página pela internet envolve informações técnicas, como endereço IP, solicitadas pelo servidor. O provedor de hospedagem, os registros que ele mantém, suas finalidades, bases legais, destinatários e prazos de retenção deverão ser verificados e informados antes da publicação. Não afirmamos que a infraestrutura deixa de tratar dados.',
        ],
      },
      {
        title: 'Cookies e armazenamento',
        paragraphs: [
          'O código desta apresentação não instala cookies, não grava preferências em armazenamento local e não inclui ferramentas de publicidade ou análise de audiência. Fontes e imagens são servidas pelo próprio site.',
          'Como não há cookies opcionais nesta implementação, não há banner pedindo consentimento. Se novas tecnologias de rastreamento forem adicionadas, este aviso e os controles de escolha deverão ser revisados antes de ativá-las.',
        ],
      },
      {
        title: 'Compartilhamento e links externos',
        paragraphs: [
          'Não há envio de formulários nem integração de publicidade nesta versão. Os links para legislação e ANPD levam a sites externos com práticas próprias. O acesso a esses sites ocorre somente quando você abre o link.',
          'Fornecedores de hospedagem, eventuais transferências internacionais e condições de compartilhamento deverão ser identificados antes da publicação.',
        ],
      },
      {
        title: 'Funcionalidades futuras',
        paragraphs: [
          'Cadastro, anúncios e contato entre leitores exigirão um novo levantamento de dados, finalidades, bases legais, conservação, segurança e direitos dos titulares. A apresentação não coleta consentimento antecipado para essas funcionalidades.',
          'Não envie senhas, documentos ou dados sensíveis por canais não confirmados como oficiais.',
        ],
      },
      {
        title: 'Direitos e atendimento',
        paragraphs: [
          'Consulte “Seus direitos e LGPD” para conhecer os direitos previstos na legislação. O canal de solicitações ao responsável pelo IpêBook ainda não está disponível; esta versão não recebe pedidos nem gera protocolos fictícios.',
          'Última revisão: 29 de setembro de 2026. A política precisa de revisão pelo responsável antes da operação real.',
        ],
      },
    ],
  },
  lgpd: {
    title: 'Seus direitos e LGPD',
    intro:
      'A Lei Geral de Proteção de Dados Pessoais dá a você direitos sobre o uso dos seus dados.',
    sections: [
      {
        title: 'Entender e acessar',
        paragraphs: [
          'Nos termos da LGPD, você pode solicitar confirmação de tratamento e acesso aos seus dados, além de informações sobre compartilhamento.',
        ],
      },
      {
        title: 'Corrigir e limitar',
        paragraphs: [
          'Você pode pedir a correção de dados incompletos, inexatos ou desatualizados e a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei.',
        ],
      },
      {
        title: 'Escolher e solicitar',
        paragraphs: [
          'Quando o tratamento se basear em consentimento, você pode revogá-lo e pedir a eliminação dos dados, observadas as exceções legais. Também tem direito a informações sobre a possibilidade de não consentir e suas consequências. A portabilidade depende dos requisitos legais e da regulamentação aplicável.',
        ],
      },
      {
        title: 'Decisões automatizadas',
        paragraphs: [
          'A LGPD prevê a possibilidade de solicitar revisão de decisões tomadas unicamente com base em tratamento automatizado que afetem seus interesses. Esta apresentação não implementa esse tipo de decisão.',
        ],
      },
      {
        title: 'Como exercer seus direitos',
        paragraphs: [
          'O responsável pelo IpêBook ainda precisa informar um canal oficial para receber solicitações. Ele não está disponível nesta apresentação; não há formulário de pedido ou protocolo de atendimento.',
          'Os direitos são exercidos observando as condições e exceções da lei. Consulte a legislação e as orientações da ANPD nos links abaixo.',
        ],
      },
    ],
  },
};

export const questions = [
  {
    question: 'O que é o IpêBook?',
    answer:
      'É um projeto para aproximar leitores de Piripiri, no Piauí, e dar novos destinos aos livros por meio de compra, troca e doação.',
  },
  {
    question: 'Já posso criar uma conta ou anunciar um livro?',
    answer:
      'Ainda não. Esta é a página de apresentação do projeto. O cadastro, os anúncios e o contato entre leitores estão em preparação.',
  },
  {
    question: 'Qual é a diferença entre venda, troca e doação?',
    answer:
      'Na venda, o livro tem um preço em reais. Na troca, as pessoas combinam quais livros desejam trocar. Na doação, o livro é oferecido gratuitamente.',
  },
  {
    question: 'Como será a entrega dos livros?',
    answer:
      'A proposta é que as pessoas combinem a entrega presencial na cidade. Prefira locais públicos e confirme as condições do livro antes do encontro. O agendamento ainda não está disponível.',
  },
  {
    question: 'Preciso informar meus dados para conhecer o projeto?',
    answer:
      'Não é necessário se cadastrar para navegar por esta apresentação. Ela não inclui formulários, publicidade ou análise de audiência. Os detalhes e as pendências de hospedagem estão na Política de Privacidade.',
  },
];
