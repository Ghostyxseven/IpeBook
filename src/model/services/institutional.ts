import type { LegalDocument, LegalPage, Page } from '../entities/Institutional';

export function resolvePage(hash: string): Page {
  const page = hash.replace(/^#/, '');
  return page === 'termos' || page === 'privacidade' || page === 'lgpd' || page === 'seguranca'
    ? page
    : 'inicio';
}

export const instagram = {
  label: 'Instagram do IpêBook',
  handle: '@ipebook',
  url: 'https://www.instagram.com/ipebook/',
} as const;

export const legalLinks = [
  { id: 'termos', label: 'Termos de Uso' },
  { id: 'privacidade', label: 'Privacidade' },
  { id: 'lgpd', label: 'Seus direitos e LGPD' },
  { id: 'seguranca', label: 'Segurança' },
] as const;

const sources = {
  lgpd: {
    label: 'Lei Geral de Proteção de Dados Pessoais — texto oficial',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm',
  },
  rights: {
    label: 'ANPD — direitos dos titulares',
    url: 'https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares',
  },
  requests: {
    label: 'ANPD — orientações ao titular de dados',
    url: 'https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados',
  },
  cookies: {
    label: 'ANPD — materiais educativos e guia sobre cookies',
    url: 'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes',
  },
  safety: {
    label: 'CERT.br — cartilhas de segurança na internet',
    url: 'https://cartilha.cert.br/fasciculos/',
  },
};

export const documents: Record<LegalPage, LegalDocument> = {
  termos: {
    title: 'Termos de Uso',
    intro:
      'Entenda o que você pode fazer nesta apresentação e quais condições ainda serão definidas para o aplicativo.',
    summary: [
      'A navegação é gratuita e não exige cadastro.',
      'Livros, preços e condições da estante são exemplos fictícios.',
      'Não há compra, anúncio, reserva, mensagem ou pagamento nesta versão.',
    ],
    sources: [sources.lgpd],
    sections: [
      {
        title: '1. A que estes termos se aplicam',
        paragraphs: [
          'O IpêBook é um projeto para conectar leitores de Piripiri, Piauí, por meio de compra, venda, troca e doação de livros. Estes termos descrevem somente a apresentação institucional que você está acessando.',
          'Esta versão não permite criar contas, publicar anúncios, negociar, enviar mensagens ou efetuar pagamentos. Entrar e Criar conta exibem um aviso de indisponibilidade. Conhecer o projeto não cria uma conta, um pedido ou uma obrigação de compra.',
        ],
      },
      {
        title: '2. Guias e exemplos interativos',
        paragraphs: [
          'Você pode ler os capítulos, consultar os guias, buscar e filtrar a estante ilustrativa e abrir os detalhes dos exemplos. Títulos, preços e condições foram criados para demonstrar a experiência: não representam ofertas, estoque ou pessoas vendendo livros.',
          'Os botões Quero comprar e Quero vender levam a orientações. Não confirmam transações. Na proposta futura, venda terá preço em reais, troca indicará o interesse e doação será gratuita. Condições de anúncios, entrega, pagamento, cancelamento e solução de conflitos precisam ser definidas antes da operação.',
        ],
      },
      {
        title: '3. Uso respeitoso e proteção de direitos',
        paragraphs: [
          'Não use a página para fraude, personificação, distribuição de conteúdo malicioso, acesso indevido ou interferência no funcionamento do serviço. Respeite a privacidade de outras pessoas e os direitos sobre textos, imagens e obras.',
          'A possibilidade futura de circular exemplares não autoriza copiar ou distribuir obras sem permissão. Estes termos não afastam direitos assegurados por lei, inclusive os de proteção de dados e de consumidores, quando aplicáveis.',
        ],
      },
      {
        title: '4. Instagram e outros sites',
        paragraphs: [
          'O perfil @ipebook no Instagram está indicado para acompanhar o projeto. Ao abrir esse link, você sai da apresentação e passa a usar um serviço externo, com termos e práticas de privacidade próprios.',
          'O link não cria uma integração de cadastro ou compra. Não há pagamento, reserva ou atendimento de pedidos pelo site. A inclusão do perfil não o transforma em canal formal de solicitações LGPD ou suporte com prazo de resposta garantido.',
        ],
      },
      {
        title: '5. Disponibilidade e próximas versões',
        paragraphs: [
          'A apresentação pode ser corrigida e atualizada durante o desenvolvimento. Não há data de lançamento anunciada. Nenhuma avaliação de leitores, verificação de identidade ou garantia de transação é oferecida nesta versão.',
          'Antes de ativar contas, anúncios ou comunicação entre leitores, será necessário apresentar as regras do serviço e revisar a privacidade. A navegação atual não vale como consentimento para tratamentos futuros nem como aceite antecipado dessas regras.',
        ],
      },
      {
        title: '6. Responsável e revisão',
        paragraphs: [
          'A identificação do responsável pelo serviço e o canal formal de atendimento ainda precisam ser informados. O Instagram está disponível como referência social; não substitui essas informações.',
          'Versão preliminar revisada em 29 de setembro de 2026. Alterações serão apresentadas nesta página. Antes da operação real, o responsável deverá completar e revisar os documentos conforme o funcionamento efetivo do serviço.',
        ],
      },
    ],
  },
  privacidade: {
    title: 'Política de Privacidade',
    intro:
      'O que fica no seu navegador, quando você acessa um serviço externo e quais informações ainda precisam ser confirmadas.',
    summary: [
      'A busca e os filtros funcionam localmente, sem envio de termos a uma API.',
      'O código da apresentação não inclui anúncios, analytics ou cookies opcionais.',
      'A hospedagem e o Instagram precisam ser considerados separadamente.',
    ],
    sources: [sources.lgpd, sources.cookies, sources.rights],
    sections: [
      {
        title: '1. Escopo e responsável pelos dados',
        paragraphs: [
          'Esta política trata da apresentação institucional, não de um aplicativo de compra e venda em operação. A identificação do controlador e o canal específico de privacidade continuam pendentes. Esses dados deverão ser completados pelo responsável.',
          'O perfil @ipebook permite acompanhar o projeto no Instagram. Não está definido como canal formal para receber pedidos sobre dados pessoais. Esta política não se apresenta como certificação de conformidade com a LGPD.',
        ],
      },
      {
        title: '2. Busca, filtros e navegação',
        paragraphs: [
          'A busca da estante usa o texto digitado para filtrar uma lista de exemplos no próprio navegador. Não envia a consulta a um servidor ou ferramenta de análise. Guias escolhidos, filtros e detalhes abertos ficam no estado temporário da página; o código não os salva como perfil de leitura.',
          'A busca serve para títulos e categorias: não informe CPF, senhas, endereço ou outros dados pessoais. Não há formulário de cadastro, envio de arquivos, solicitação de localização precisa ou coleta de pagamento nesta versão.',
          'Os nomes de capítulos e documentos aparecem no fragmento do endereço, como #privacidade. O navegador pode manter essas páginas no seu histórico, conforme suas próprias configurações.',
        ],
      },
      {
        title: '3. Dados técnicos da infraestrutura',
        paragraphs: [
          'Para entregar uma página pela internet, a infraestrutura recebe informações técnicas, como endereço IP e características da requisição. O provedor pode manter registros de acesso ou segurança. A ausência de cadastro não significa ausência total de tratamento de dados.',
          'Ainda falta confirmar os serviços e registros efetivamente usados, finalidades, bases legais, destinatários, localização do tratamento e prazos de conservação. Não atribuímos um prazo ou uma base legal genérica sem esse levantamento. O aviso deverá ser atualizado com os fatos da hospedagem antes da publicação ou da ampliação do serviço.',
        ],
      },
      {
        title: '4. Cookies, armazenamento e recursos locais',
        paragraphs: [
          'O código desta apresentação não instala cookies, não grava buscas ou preferências em localStorage ou sessionStorage e não inclui publicidade, pixels ou análise de audiência. Fontes e imagens da apresentação são servidas pelo próprio site. Recursos podem permanecer no cache do navegador conforme suas configurações.',
          'Não há banner de consentimento para tecnologias opcionais que não estão presentes nesta implementação. Se forem adicionadas, suas finalidades e opções deverão ser avaliadas e apresentadas antes de ativá-las. Esta descrição do código não substitui a conferência da infraestrutura publicada.',
        ],
      },
      {
        title: '5. Ao abrir o Instagram ou uma fonte externa',
        paragraphs: [
          'O Instagram aparece apenas como link: não incorporamos publicações, botão de login, widget ou pixel da rede social. Abrir a apresentação não carrega conteúdo do Instagram por iniciativa do nosso código.',
          'Ao clicar no link, você acessa o Instagram, que poderá tratar informações segundo suas próprias políticas e configurações da sua conta. Interações, comentários e mensagens naquela rede não são processados pela busca ou pelos filtros deste site. Evite publicar documentos ou informações sensíveis.',
          'Os links para legislação, ANPD e CERT.br também levam a serviços externos. A forma como cada serviço trata dados deve ser consultada no próprio destino.',
        ],
      },
      {
        title: '6. Novas funcionalidades e segurança',
        paragraphs: [
          'Contas, anúncios, mensagens e pagamentos ainda não existem nesta apresentação. Antes de introduzi-los, será necessário identificar os dados necessários, finalidades, bases legais, compartilhamentos, conservação e controles de segurança. Não coletamos autorização antecipada para isso.',
          'O desenvolvimento futuro também deverá avaliar o tratamento de dados de crianças e adolescentes de acordo com a legislação aplicável e seu melhor interesse. Esta versão não oferece cadastro a nenhuma faixa etária.',
          'Nenhum serviço pode prometer risco zero. A página Segurança reúne cuidados de navegação; ela não afirma que recursos como verificação de identidade ou proteção de pagamentos estejam implementados.',
        ],
      },
      {
        title: '7. Direitos e atualização',
        paragraphs: [
          'A página Seus direitos e LGPD explica os principais pedidos previstos na lei e indica orientações da ANPD. O canal de privacidade do IpêBook ainda não está disponível. Não recebemos requerimentos ou emitimos protocolos por esta apresentação.',
          'Última revisão: 29 de setembro de 2026. Identificação do controlador, contato de privacidade e informações reais da infraestrutura são pendências para completar este aviso.',
        ],
      },
    ],
  },
  lgpd: {
    title: 'Seus direitos e LGPD',
    intro:
      'Conheça seus direitos sobre dados pessoais e saiba o que ainda falta para exercê-los diretamente com o IpêBook.',
    summary: [
      'Você pode pedir informações sobre o tratamento dos seus dados.',
      'Os direitos dependem das condições legais de cada situação.',
      'O canal formal de privacidade do IpêBook ainda não está disponível.',
    ],
    sources: [sources.lgpd, sources.rights, sources.requests],
    sections: [
      {
        title: '1. Saber, acessar e corrigir',
        paragraphs: [
          'Você pode pedir confirmação de tratamento, acesso aos seus dados e correção de informações incorretas, incompletas ou antigas. Também pode solicitar explicações sobre finalidade, duração, responsáveis e compartilhamento.',
        ],
      },
      {
        title: '2. Limitar, eliminar e portar',
        paragraphs: [
          'Dados desnecessários, excessivos ou tratados irregularmente podem ser objeto de pedido de anonimização, bloqueio ou eliminação. A portabilidade observa a regulamentação e os limites legais. A exclusão não é absoluta: existem hipóteses legais de conservação.',
        ],
      },
      {
        title: '3. Consentimento e oposição',
        paragraphs: [
          'Quando a base for consentimento, você pode retirá-lo e pedir eliminação, respeitadas as exceções legais, além de saber as consequências de não consentir. A LGPD também prevê oposição a tratamento baseado em hipótese de dispensa de consentimento quando houver descumprimento da lei.',
        ],
      },
      {
        title: '4. Decisões automatizadas',
        paragraphs: [
          'Você pode solicitar revisão de decisões exclusivamente automatizadas que afetem seus interesses e informações sobre os critérios utilizados, nos limites legais. A busca local desta apresentação apenas filtra exemplos; não decide crédito, acesso ao serviço ou reputação de pessoas.',
        ],
      },
      {
        title: '5. Como preparar uma solicitação',
        paragraphs: [
          'Indique qual direito deseja exercer, a situação envolvida e uma forma de receber resposta. Compartilhe somente informações necessárias; não publique documentos, senhas ou dados de terceiros em comentários de redes sociais.',
          'O canal dedicado do IpêBook ainda não está disponível e a identificação do controlador precisa ser completada. O perfil do Instagram não foi definido como canal formal LGPD. Por isso, esta apresentação não possui formulário de solicitação, prazo operacional anunciado ou protocolo de atendimento.',
          'O exercício dos direitos é gratuito. A identidade do solicitante pode precisar ser verificada de forma proporcional para evitar entrega de dados à pessoa errada. Prazos variam conforme o pedido e a legislação: não existe aqui uma promessa de resposta única para todos os casos.',
        ],
      },
      {
        title: '6. Orientação da ANPD',
        paragraphs: [
          'Para uma petição de titular à ANPD, procure primeiro exercer seu direito com o controlador e guarde os registros da tentativa. Se a questão não for resolvida, consulte as instruções e os requisitos atualizados no portal da ANPD. Uma denúncia de possível irregularidade tem finalidade diferente de um pedido sobre os seus próprios dados.',
          'Os links de consulta abaixo não enviam uma solicitação em seu nome. Este texto informativo não restringe outros meios de proteção previstos na legislação.',
        ],
      },
    ],
  },
  seguranca: {
    title: 'Segurança',
    intro:
      'Cuidados para conhecer o projeto, reconhecer abordagens suspeitas e se preparar para futuros encontros entre leitores.',
    summary: [
      'O IpêBook não recebe pagamentos nem confirma reservas nesta apresentação.',
      'Nunca compartilhe senha, código de acesso ou documento em comentários públicos.',
      'Os exemplos da estante não são ofertas reais.',
    ],
    sources: [sources.safety],
    sections: [
      {
        title: '1. O que esta versão não solicita',
        paragraphs: [
          'Não há cobrança para conhecer o projeto, abrir exemplos ou consultar os guias. Esta apresentação não solicita Pix, cartão, senha, código recebido por SMS ou documentos. Não existe taxa de liberação de livro, reserva ou anúncio aqui.',
          'Se alguém usar o nome IpêBook para cobrar por um dos exemplos da estante, essa cobrança não foi gerada por esta apresentação. Não confunda a demonstração com uma compra ativa.',
        ],
      },
      {
        title: '2. Links, perfis e mensagens',
        paragraphs: [
          'Confira o endereço antes de abrir links e desconfie de urgência, prêmios, pedidos de códigos ou pagamentos inesperados. Use senhas diferentes e verificação em duas etapas nas suas contas externas, quando disponíveis.',
          'O perfil indicado neste site é @ipebook no Instagram. Verifique a grafia; nomes parecidos não comprovam vínculo. O link serve para acompanhar o projeto e não comprova a legitimidade de mensagens recebidas de outros perfis.',
        ],
      },
      {
        title: '3. Antes de combinar um livro',
        paragraphs: [
          'Nos fluxos futuros, confira título, edição, fotos, conservação e condições combinadas. Venda envolve preço em reais; troca depende do interesse das duas pessoas; doação é gratuita. Não exponha seu endereço residencial desnecessariamente.',
          'Prefira um encontro em local público, combine horário e confira o exemplar. Essas orientações reduzem riscos, mas não garantem a segurança de uma pessoa ou de uma negociação. O site ainda não verifica vendedores, agenda encontros ou protege pagamentos.',
        ],
      },
      {
        title: '4. Se uma abordagem parecer suspeita',
        paragraphs: [
          'Interrompa o contato, guarde registros e utilize a denúncia da plataforma onde ocorreu a abordagem. Se tiver fornecido credenciais, altere-as no serviço legítimo. Se houver pagamento indevido, procure prontamente sua instituição financeira pelos canais oficiais e avalie registrar ocorrência.',
          'Não publique comprovantes com dados pessoais. O IpêBook ainda não oferece ferramenta de denúncia ou canal dedicado a incidentes nesta apresentação; não há atendimento ou recuperação de valores garantidos pelo site.',
        ],
      },
      {
        title: '5. Proteção técnica e limites',
        paragraphs: [
          'A implementação atual utiliza exemplos locais e links externos, sem integração de pagamento ou rede social. Isso não elimina riscos da internet nem substitui a análise da hospedagem e do aplicativo futuro.',
          'Antes de operar contas e anúncios, o projeto precisará definir controles de acesso, tratamento de denúncias, resposta a incidentes e atendimento. Publicar estas orientações não significa que esses recursos já estejam implantados.',
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
  {
    question: 'Como preparar um livro para vender?',
    answer:
      'Separe título, autor e edição, fotografe o exemplar e descreva marcas ou anotações. Defina o preço em reais. O guia Vender ajuda a se preparar, mas publicar anúncios ainda não está disponível.',
  },
  {
    question: 'Posso comprar os livros da estante de exemplos?',
    answer:
      'Não. Os títulos, preços e condições dessa estante são fictícios e servem apenas para demonstrar a interface. Nenhum exemplar está sendo oferecido para compra, troca ou doação nesta versão.',
  },
];
