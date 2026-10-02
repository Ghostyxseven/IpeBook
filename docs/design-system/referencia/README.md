# IpêBook

Uma plataforma para anunciar, descobrir, doar, trocar e vender livros entre pessoas da mesma cidade, começando por Piripiri (PI). O sistema segue o **Material Design 3**, com uma voz própria: quente, de livraria de bairro, e com a cor de cada modalidade sempre igual.

> Histórias que seguem.

## Seções deste guia

Além desta página: **Tipografia** (escalas de marca, Android, iOS e Web), **iOS** (Liquid Glass e padrões nativos), **Web e responsivo** (classes de janela e layouts), **Movimento e estados** e **Acessibilidade**. Componentes de iOS levam o prefixo `IOS`, os da Web o prefixo `Web`.

## Voz e conteúdo

- **Fala como um vizinho leitor.** Frases curtas, em segunda pessoa, sem jargão de marketplace. "Tenho interesse", não "Iniciar negociação".
- **Títulos contam a história do livro.** Telas importantes usam um título serifado com metáfora de leitura: "Entre e continue sua história.", "Seu livro ganhou um novo começo.", "Um encontro, um novo capítulo." Use com moderação, só em começos e conclusões.
- **Segurança sem medo.** Lembre de locais públicos e de conferir o exemplar em tom de dica, não de alerta: "Prefira horários de movimento."
- **Diga a consequência.** Ações sensíveis explicam o que acontece: "Ela não poderá enviar mensagens nem propostas."
- **Português do Brasil, sem caixa-alta em botões.** Valores em `R$ 25,00`, datas como `Sáb, 03/10`, horas como `10h`.

## Fundamentos visuais

**Cor.** Papéis do M3 gerados a partir do verde `primary`, em claro e escuro. Superfícies creme (`surface`) dão o ar de papel. A cor de destaque é o âmbar: `tertiary-container` para o marca-texto dos títulos e `brand-amber` para o traço do logotipo.

**Modalidades.** Venda = `secondary-container` (verde-claro), Troca = `tertiary-container` (âmbar), Doação = `doacao-container` (terracota-claro). A tag sempre traz o nome da modalidade, então a cor nunca é o único sinal.

**Tipografia.** Source Serif 4 (`--font-serif`) para o logotipo e títulos de destaque; Roboto Flex (`--font-sans`) para toda a interface, na escala do M3. O marca-texto é um bloco `tertiary-container` com raio `radius-sm` atrás da segunda linha do título.

**Forma.** Botões e busca em pílula (`radius-full`); chips e tags com `radius-sm`; cartões `radius-md`; campos de acesso `radius-lg`; folhas, diálogos e painéis `radius-xxl`.

**Espaço.** Grade de 4px. Margem lateral de 16px no celular (`space-4`), 80px na Web. Alvo de toque mínimo de 48px; botões de 52px.

**Elevação.** Quase plana: hierarquia por cor de superfície (`surface-container-*`), sombra só no FAB e no snackbar.

**Decoração.** Só nas telas de acesso (boas-vindas, entrar, criar conta, recuperar): um galho de ipê-amarelo no canto superior direito (150×120, a partir de 40px do topo), com flores `ipe-flower`, miolo `ipe-flower-center`, galho `ipe-branch` e folhas `ipe-leaf`. Ele fica fora da área do texto e da barra de status e nunca passa por trás de título, botão ou ícone. Telas de uso (Início, Explorar, fluxos) não têm decoração: a hierarquia vem das superfícies.

## Iconografia

Ícones de traço, 24px, espessura 1,8, cantos e pontas arredondados, na cor do texto (`on-surface` ou `on-surface-variant`). Ícones sozinhos sempre têm `aria-label`. Sem emoji.

## Ilustração

O livro aberto com folhas de ipê voando é a ilustração da marca (grupo Ilustrações), usada nas boas-vindas e no herói da Web. As capas ilustrativas usam `cover-navy`, `cover-brown` ou `cover-forest` com o sol `cover-sun` e duas montanhas em traço claro.

## Acessibilidade

Contraste mínimo de 4,5:1 para texto (3:1 acima de 24px e para bordas de controle), nos dois temas. Controles reais (`button`, `a`, `input`, `label`), foco visível de 3px, texto nunca menor que 12px, alvo de toque de 48px.

## Plataformas

- **Android:** Material 3 nativo (Jetpack Compose), com os tokens de cor mapeados para `ColorScheme`. Barra de navegação inferior com 4 destinos, FAB "Anunciar livro" na Estante e folhas inferiores.
- **iOS (iOS 26):** mesma marca e as mesmas cores por modalidade, com a linguagem nativa da Apple:
  - **Liquid Glass só na camada de navegação** (barra de abas flutuante, botões circulares da barra superior, barra de mensagem, controles sobre a câmera). O conteúdo (listas, cartões, campos) fica em superfícies sólidas, para manter a leitura.
  - Barra de abas flutuante com Início, Estante e Perfil; **Explorar é a aba de busca**, no círculo separado à direita.
  - Títulos grandes em SF Pro (34pt); a fonte serifada da marca fica para os títulos de destaque (boas-vindas, conclusões).
  - Listas agrupadas com cantos de 12pt, controle segmentado para as modalidades, chaves e seletores nativos (data e hora em pílula).
  - Fluxos modais como folhas com alça (propor troca, livro identificado) e confirmação destrutiva em alerta.
  - **Live Activity** na tela bloqueada no dia do encontro, com contagem regressiva e "Estou a caminho".
  - Login com "Continuar com a Apple" obrigatório sempre que houver login com Google; use os botões oficiais das duas empresas.
- **Web (1440×1024):** cabeçalho com busca e "Anunciar", conteúdo com margem de 80px. Explorar com filtros na lateral e grade de 4 colunas, encontro em duas colunas com o resumo fixo, conversas em três painéis (lista, conversa, detalhes). Abaixo de 840px, usa o layout mobile.
- **Tablet:** navigation rail com o botão Anunciar no topo e lista e detalhe lado a lado.
