import type { LegalDocument, LegalPage, Page } from '../entities/Institutional';

export function resolvePage(hash: string): Page {
  const page = hash.replace(/^#/, '');
  return page === 'termos' || page === 'privacidade' || page === 'lgpd' || page === 'seguranca'
    ? page
    : 'inicio';
}

/** Os documentos têm endereço próprio (/privacidade); os capítulos do livro seguem em /#capitulo. */
export function resolveRoute(pathname: string, hash: string): Page {
  const path = pathname.replace(/^\/+|\/+$/g, '');
  return path ? resolvePage(path) : resolvePage(hash);
}

/** Endereço canônico quando o visitante chega por um link antigo (/#privacidade) ou desconhecido. */
export function canonicalPath(pathname: string, hash: string): string | null {
  const page = resolveRoute(pathname, hash);
  const wanted = page === 'inicio' ? '/' : `/${page}`;
  const current = pathname.replace(/\/+$/, '') || '/';
  if (current === wanted) return null;
  return page === 'inicio' ? `/${hash}` : wanted;
}

export const instagram = {
  label: 'Instagram do IpêBook',
  handle: '@ipebook',
  url: 'https://www.instagram.com/ipebook/',
} as const;

// E-mail informado pelo projeto. Não é um canal formal de LGPD nem garante prazo de resposta.
export const contact = {
  label: 'E-mail do IpêBook',
  email: 'ipebook738@gmail.com',
  url: 'mailto:ipebook738@gmail.com',
} as const;

export const legalLinks = [
  { id: 'termos', label: 'Termos de Uso', href: '/termos' },
  { id: 'privacidade', label: 'Privacidade', href: '/privacidade' },
  { id: 'lgpd', label: 'Seus direitos e LGPD', href: '/lgpd' },
  { id: 'seguranca', label: 'Segurança', href: '/seguranca' },
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

const revisedAt = '1 de outubro de 2026';

export const documents: Record<LegalPage, LegalDocument> = {
  termos: {
    title: 'Termos de Uso',
    intro:
      'Conheça o que já funciona no site, o que ainda está em construção e os cuidados ao usar a apresentação.',
    summary: [
      'Você pode explorar o projeto gratuitamente, sem cadastro.',
      'Livros, preços e condições da estante são exemplos fictícios.',
      'Ainda não é possível comprar, anunciar, reservar ou pagar por aqui.',
    ],
    sections: [
      {
        title: 'O que posso fazer aqui?',
        paragraphs: [
          'Você pode conhecer o IpêBook, ler os guias, buscar livros na estante de exemplos e abrir seus detalhes. O projeto quer aproximar leitores de Piripiri, no Piauí, para venda, troca e doação de livros.',
          'No site, Entrar e Criar conta apenas mostram um aviso. O aplicativo para Android e iOS, ainda em desenvolvimento, permite criar uma conta com nome, e-mail e senha, confirmar o e-mail com um código e entrar. Nenhuma versão permite publicar anúncios, negociar, enviar mensagens ou pagar. Visitar o site não cria uma conta nem uma obrigação de compra.',
        ],
      },
      {
        title: 'Como funciona a conta?',
        paragraphs: [
          'Use um e-mail seu e uma senha exclusiva para o IpêBook. Mantenha a senha em segredo: quem tiver acesso a ela pode entrar na sua conta.',
          'A conta existe apenas no aplicativo. Depois de entrar, você pode ver o catálogo de livros anunciados por outras pessoas (Início, Explorar e detalhe do livro). Ainda não é possível publicar anúncios, fazer pedidos, trocar mensagens nem ter perfil público.',
          `Excluir a conta pelo aplicativo ainda não é possível. Por enquanto, pedidos sobre a conta podem ser enviados para ${contact.email}, sem prazo de resposta garantido. Essa pendência precisa ser resolvida antes de o cadastro ser divulgado.`,
        ],
      },
      {
        title: 'Os livros estão à venda?',
        paragraphs: [
          'Não. Títulos, preços e condições são exemplos fictícios para mostrar como a experiência poderá funcionar. Eles não representam ofertas, estoque ou vendedores reais.',
          'Quero comprar e Quero vender abrem orientações, sem confirmar negócios. Na proposta do projeto, venda tem preço em reais, troca depende de um acordo e doação é gratuita.',
          'As regras de entrega, pagamento, cancelamento e solução de conflitos ainda precisam ser definidas antes de o serviço começar a operar.',
        ],
      },
      {
        title: 'Quais cuidados devo ter ao usar o site?',
        paragraphs: [
          'Respeite outras pessoas e os direitos sobre textos, imagens e livros. Não use a página para golpes, para se passar por outra pessoa ou para tentar acessar ou danificar sistemas.',
          'Vender ou trocar um exemplar não dá autorização para copiar ou distribuir a obra sem permissão. Estes termos preservam os direitos previstos em lei, inclusive de consumidores e de proteção de dados, quando aplicáveis.',
        ],
      },
      {
        title: 'O que acontece ao abrir o Instagram?',
        paragraphs: [
          'Você sai do site e passa a usar um serviço com regras e práticas de privacidade próprias. O perfil @ipebook serve para acompanhar o projeto.',
          'O link não cria cadastro, compra ou reserva. O Instagram não foi definido como canal formal para pedidos sobre dados pessoais; também não há prazo de atendimento garantido pelo site. Para pedidos sobre dados, escreva para ' +
            contact.email +
            '.',
        ],
      },
      {
        title: 'O que pode mudar nas próximas versões?',
        paragraphs: [
          'A apresentação pode receber correções e atualizações. Ainda não há data de lançamento, verificação de identidade, avaliação de leitores ou garantia de transações.',
          'Antes de ativar anúncios e mensagens, o projeto deverá apresentar as novas regras e atualizar a privacidade. Navegar hoje não significa aceitar regras futuras ou autorizar novos usos dos seus dados.',
        ],
      },
      {
        title: 'Quem é responsável e como pedir ajuda?',
        paragraphs: [
          `O IpêBook é um projeto de faculdade, sem fins lucrativos, conduzido pela equipe do IpêBook, formada por pessoas físicas. O IpêBook não cobra comissão nem recebe o valor das vendas: quando as vendas existirem, serão combinadas diretamente entre os leitores. A identificação individual do controlador dos dados ainda não foi divulgada. Você pode escrever para ${contact.email}, sem prazo de resposta garantido. O Instagram é uma referência social e não substitui o e-mail.`,
          'Texto preliminar revisado em 1 de outubro de 2026. As mudanças serão apresentadas nesta página. Os documentos precisam ser completados e revisados antes de o serviço operar.',
        ],
      },
    ],
    revisedAt,
    sources: [sources.lgpd],
  },
  privacidade: {
    title: 'Política de Privacidade',
    intro:
      'Veja quais dados a conta usa, o que acontece com suas buscas, o que a hospedagem recebe e como entender seus direitos.',
    summary: [
      'Suas buscas filtram exemplos no próprio navegador, sem enviar o texto a um servidor.',
      'Ao criar uma conta no aplicativo, nome, e-mail e senha são tratados pelo Supabase, o serviço de autenticação do projeto.',
      'O site mede visitas e desempenho de forma agregada com ferramentas da Vercel, sem cookies nem publicidade.',
      `As informações da hospedagem ainda precisam ser confirmadas. O contato para pedidos sobre dados é ${contact.email}.`,
    ],
    sections: [
      {
        title: 'Quais dados a conta usa?',
        paragraphs: [
          'O cadastro existe apenas no aplicativo para Android e iOS, ainda em desenvolvimento; o site não coleta esses dados. Para criar a conta, pedimos nome, e-mail e senha. O nome aparece na sua área inicial. O e-mail serve para entrar, confirmar a conta e recuperar a senha, por meio de códigos enviados a ele.',
          'Esses dados são tratados pelo Supabase, o serviço que hospeda a autenticação. A senha viaja por conexão segura e é guardada cifrada (hash): o IpêBook não consegue lê-la. O serviço pode registrar dados técnicos de acesso, como endereço IP, data e hora, para proteger a conta.',
          'Depois que você entra, a sessão fica guardada no armazenamento do aplicativo, no celular, para não pedir a senha a cada abertura. Tocar em Sair remove a sessão. O aplicativo também guarda se você já viu a apresentação inicial.',
          'Ainda faltam confirmar a região onde os dados ficam, o prazo de conservação e a base legal. Excluir a conta pelo aplicativo ainda não é possível; pedidos podem ser enviados para ' +
            contact.email +
            '.',
        ],
      },
      {
        title: 'O que outras pessoas veem no catálogo?',
        paragraphs: [
          'No aplicativo, quem está com a conta ativa vê anúncios de outras pessoas: título, autor, categoria, modalidade (venda, troca ou doação), preço, condição do livro, descrição, capa, bairro, cidade e o primeiro nome de quem anunciou. Não há endereço completo.',
          'Quando for possível publicar anúncios, essas informações ficarão visíveis para as outras pessoas que tiverem conta no aplicativo. Não coloque no anúncio dados que você não queira mostrar, como telefone ou endereço.',
          'Os anúncios ficam no Supabase. A região do servidor, o prazo de conservação e a base legal ainda precisam ser confirmados e serão informados aqui.',
        ],
      },
      {
        title: 'O que acontece com minhas buscas?',
        paragraphs: [
          'A busca filtra os livros de exemplo no seu navegador. Não envia a consulta a um servidor. Filtros, guias e detalhes abertos ficam na memória da página; o código não cria um perfil de leitura nem salva essas escolhas para outra visita. A única preferência guardada é o modo de leitura, explicado abaixo.',
          'Digite apenas títulos ou categorias. Não informe CPF, senha ou endereço. Esta versão não tem envio de arquivos, pedido de localização precisa ou coleta de pagamento.',
          'Seu navegador pode guardar as páginas visitadas no histórico, conforme suas configurações.',
        ],
      },
      {
        title: 'O site usa cookies ou rastreamento?',
        paragraphs: [
          'O código da apresentação não instala cookies nem salva buscas. Em localStorage, uma área de armazenamento do navegador, guarda apenas a sua escolha entre Livro 3D e Leitura normal, para lembrá-la na próxima visita. Essa informação fica no seu aparelho, só é gravada depois que você escolhe um modo e pode ser apagada limpando os dados do site. Não há publicidade nem pixels de rastreamento de redes sociais.',
          'O site usa Vercel Web Analytics e Vercel Speed Insights, da empresa que hospeda a página. Eles registram a página aberta, a origem da visita, o país aproximado, o tipo de aparelho e navegador e o tempo de carregamento, e mostram os resultados de forma agregada. Segundo a Vercel, essas ferramentas não usam cookies. A base legal e o prazo de conservação ainda precisam ser confirmados.',
          'Fontes e imagens vêm do próprio site. O navegador pode guardar cópias desses arquivos no cache para carregar a página mais rápido.',
          'Não há banner para cookies opcionais porque eles não estão presentes no código atual. Se isso mudar, as finalidades e as opções deverão ser avaliadas antes da ativação. Ainda é necessário conferir o que a infraestrutura publicada utiliza.',
        ],
      },
      {
        title: 'A hospedagem recebe algum dado?',
        paragraphs: [
          'Ao abrir um site, a infraestrutura que entrega a página recebe dados técnicos, como seu endereço IP e informações da conexão. O provedor pode manter registros de acesso ou segurança. Não ter cadastro não significa que nenhum dado seja tratado.',
          'Falta confirmar os serviços e registros usados, as finalidades e as bases legais (o que permite usar os dados pela lei). Também faltam os destinatários, os locais de tratamento e os prazos de conservação.',
          'Essas informações devem ser conferidas e incluídas no aviso antes da publicação ou ampliação do serviço. Não há um prazo de retenção confirmado nesta apresentação.',
        ],
      },
      {
        title: 'E quando abro o Instagram ou outro link?',
        paragraphs: [
          'O Instagram é apenas um link: não incorporamos publicações, login ou rastreadores da rede social. Nosso código não carrega conteúdo do Instagram só porque você abriu esta página.',
          'Ao clicar, você passa a usar o serviço externo, que segue suas próprias regras. Isso vale também para os links da ANPD, da legislação e do CERT.br. Consulte a privacidade no destino.',
          'Evite enviar documentos ou informações sensíveis em comentários e mensagens. Essas interações não fazem parte da busca ou dos filtros do IpêBook.',
        ],
      },
      {
        title: 'Quem cuida dos dados e como faço um pedido?',
        paragraphs: [
          `O controlador (quem decide como os dados são usados) é a equipe do IpêBook, formada por pessoas físicas, num projeto de faculdade, sem fins lucrativos. A identificação individual do controlador ainda não foi divulgada. O contato de privacidade é ${contact.email}.`,
          `A página Seus direitos e LGPD explica os pedidos previstos na lei. Pedidos podem ser enviados para ${contact.email}; esta apresentação não tem formulário, não emite protocolos e não garante prazo de resposta.`,
          'O Instagram permite acompanhar o projeto, mas não foi definido como canal formal para esses pedidos. Este aviso não é uma certificação de conformidade com a LGPD.',
        ],
      },
      {
        title: 'O que muda quando o aplicativo funcionar?',
        paragraphs: [
          'A publicação de anúncios, as mensagens e os pagamentos ainda não estão disponíveis. Antes de ativá-los, será preciso informar quais dados serão usados, para quê, com quem serão compartilhados e por quanto tempo serão guardados, além da base legal e dos cuidados de segurança.',
          'O projeto também deverá avaliar a proteção de dados de crianças e adolescentes, conforme a lei e seu melhor interesse. O cadastro ainda não verifica a idade; essa avaliação precisa ser feita antes de divulgar o aplicativo.',
          'Navegar nesta apresentação não autoriza usos futuros dos seus dados. As dicas da página Segurança não significam que já exista verificação de identidade ou proteção de pagamentos.',
        ],
      },
      {
        title: 'Quando este texto foi atualizado?',
        paragraphs: [
          'Última revisão: 1 de outubro de 2026. Este aviso trata da apresentação e da conta do IpêBook nesta versão.',
          `Ainda faltam a identificação individual do controlador dos dados e os detalhes reais da hospedagem. O contato de privacidade é ${contact.email}. O texto deverá ser atualizado quando essas informações forem confirmadas.`,
        ],
      },
    ],
    revisedAt,
    sources: [sources.lgpd, sources.cookies, sources.rights],
  },
  lgpd: {
    title: 'Seus direitos e LGPD',
    intro:
      'Conheça seus direitos sobre dados pessoais e saiba o que ainda falta para exercê-los diretamente com o IpêBook.',
    summary: [
      'Você pode pedir informações sobre o tratamento dos seus dados.',
      'Os direitos dependem das condições legais de cada situação.',
      `Pedidos sobre dados pessoais podem ser enviados para ${contact.email}, sem prazo de resposta garantido.`,
    ],
    revisedAt,
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
          `Pedidos podem ser enviados para ${contact.email}, mas a identificação individual do controlador, que é a equipe do IpêBook (pessoas físicas, em projeto de faculdade sem fins lucrativos), ainda não foi divulgada. O perfil do Instagram não foi definido como canal formal LGPD. Por isso, esta apresentação não possui formulário de solicitação, prazo operacional anunciado ou protocolo de atendimento.`,
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
      'Saiba reconhecer uma cobrança suspeita, proteger suas informações e agir se algo parecer errado.',
    summary: [
      'O IpêBook não recebe pagamentos nem confirma reservas nesta apresentação.',
      'Não envie senhas, códigos de acesso ou documentos a quem fizer uma abordagem suspeita.',
      'Recebeu uma cobrança por um livro da demonstração? Interrompa o contato e confira a origem.',
    ],
    sections: [
      {
        title: 'Recebi uma cobrança. O que faço?',
        paragraphs: [
          'Não pague uma suposta taxa de reserva, anúncio ou liberação de livro desta apresentação. Conhecer o projeto e consultar os exemplos é gratuito.',
          'O site não solicita Pix, cartão, senha, código de SMS ou documentos. Se alguém cobrar por um livro da estante de exemplos usando o nome IpêBook, a cobrança não foi gerada por aqui.',
        ],
      },
      {
        title: 'Como reconheço uma mensagem suspeita?',
        paragraphs: [
          'Desconfie de pressa para pagar, prêmios inesperados, pedidos de códigos e links com endereço estranho. Confira o destino antes de abrir um link.',
          'O IpêBook só pede o código de confirmação dentro do próprio aplicativo. Ninguém do projeto vai pedir esse código ou sua senha por mensagem.',
          'O perfil indicado é @ipebook no Instagram. Nomes parecidos não comprovam vínculo com o projeto. O link deste site não garante que uma mensagem recebida seja legítima.',
          'Nas suas contas externas, use senhas diferentes e ative a verificação em duas etapas, quando disponível. Não compartilhe códigos de acesso.',
        ],
      },
      {
        title: 'Já enviei dados ou fiz um pagamento. E agora?',
        paragraphs: [
          'Interrompa o contato e guarde as mensagens e os comprovantes. Use a ferramenta de denúncia da plataforma onde aconteceu a abordagem.',
          'Se enviou senha ou código de acesso, procure o serviço legítimo e proteja a conta. Troque a senha comprometida, inclusive em outras contas onde você a repetiu.',
          'Se fez um pagamento indevido, procure imediatamente sua instituição financeira pelos canais oficiais. Considere registrar ocorrência. Não publique comprovantes com dados pessoais.',
          `O IpêBook ainda não tem ferramenta de denúncia nesta apresentação. Para relatar um golpe que use o nome do IpêBook, escreva para ${contact.email}. O site não garante atendimento nem recuperação de valores.`,
        ],
      },
      {
        title: 'Como combinar um livro com mais cuidado?',
        paragraphs: [
          'Esta orientação é para futuras negociações: ainda não é possível combinar uma compra, troca ou doação aqui.',
          'Confira título, edição, fotos e estado do livro. Combine as condições: venda tem preço em reais, troca exige interesse das duas pessoas e doação é gratuita.',
          'Prefira local público, combine o horário e confira o exemplar. Evite expor seu endereço residencial. Esses cuidados reduzem riscos, mas não garantem a segurança de uma pessoa ou negociação.',
        ],
      },
      {
        title: 'Que proteção o IpêBook oferece hoje?',
        paragraphs: [
          'Esta versão mostra exemplos locais e links externos. Não verifica vendedores, agenda encontros ou protege pagamentos.',
          'Antes de operar contas e anúncios, o projeto precisará definir controles de acesso, denúncias, resposta a incidentes e atendimento. As orientações desta página não significam que esses recursos já existam.',
          'Texto revisado em 1 de outubro de 2026. Nenhum serviço pode prometer risco zero; a infraestrutura e o aplicativo futuro ainda precisam ser avaliados.',
        ],
      },
    ],
    revisedAt,
    sources: [sources.safety],
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
      'No site, ainda não. O cadastro está sendo construído no aplicativo para Android e iOS, que ainda não foi lançado. Os anúncios, os pedidos e o contato entre leitores também estão em preparação.',
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
      'Não. Navegar por esta apresentação não exige cadastro. No aplicativo, a conta usa nome, e-mail e senha. O site mede visitas de forma agregada, sem publicidade. Os detalhes e as pendências estão na Política de Privacidade.',
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
