# Verificação — aplicativo Web responsivo

**Data:** 10/10/2026

**Branch de trabalho:** `feature/web-responsiva` em `/tmp/ipebook-web-responsiva`.

## Resultado local

- `npm run verify`: passou (typecheck, lint, formatação e 41 arquivos de testes, sem falhas).
- `npm run build:web`: passou; exportou a apresentação em `dist/` e o aplicativo em `dist/app/`.
- `git diff --check`: passou.
- Chromium headless, sem Playwright, com a exportação local: cadastro em 1440 × 900 mostra composição em duas colunas; em 393 × 852 mantém a composição compacta e rolagem vertical. A tela inicial em 1440 × 900 também ocupa duas colunas. Capturas do cadastro: [desktop](assets/cadastro-desktop.png) e [celular](assets/cadastro-celular.png).
- A primeira execução da CI falhou em `tests/moderation.test.mjs`: duas denúncias criadas no mesmo milissegundo não tinham ordem garantida, mas o teste exigia uma posição fixa. O teste foi ajustado para localizar cada denúncia pelo alvo e preservar as asserções sobre nomes e estado. `node --test tests/moderation.test.mjs`, `npm run verify` e a execução seguinte da CI passaram após o ajuste.

## Segunda etapa — telas auxiliares

- Bairro, alteração de senha, confirmação de acesso, perfis e configurações receberam composição em duas áreas na janela larga. Histórico e moderação usam cartões em duas colunas; rascunhos colocam a seleção ao lado das ações. As páginas de leitura e listas cronológicas mantêm largura limitada para evitar linhas excessivamente longas.
- `npm run verify` e `npm run build:web` passaram novamente após as mudanças. `git diff --check` passou.
- Chromium headless com a exportação local: a tela de conta excluída ficou centralizada e distribuída em 1440 × 900, preservando a composição compacta em 393 × 852. Capturas: [desktop](assets/confirmacao-desktop.png) e [celular](assets/confirmacao-celular.png).
- As demais rotas desta etapa exigem sessão autenticada para inspeção no navegador. A conexão do navegador pessoal ainda não estava disponível; portanto, foco, teclado e apresentação dos dados reais nessas rotas seguem pendentes.

## Limites da verificação

- O navegador pessoal não estava conectado à ferramenta de inspeção. A captura enviada pelo usuário representa a versão publicada anterior; esta branch ainda não foi publicada.
- Não havia uma sessão autenticada no navegador local. A navegação lateral/cabeçalho, listas, detalhes e conversas passaram por revisão de código, teste dos breakpoints e build, mas ainda requerem inspeção visual e funcional do fluxo autenticado, incluindo teclado, foco e estados vazios.
- O quadro Web do Figma não ficou acessível nesta sessão. Foram usados os tokens e a cópia local da referência Web do design system. A comparação final com o Figma segue pendente.
- Android e iOS não foram executados nesta validação. A seleção de composição depende de `Platform.OS === 'web'`, e o teste automatizado cobre a classe compacta nas plataformas nativas.

## Próximo passo

Conectar um navegador com sessão de teste do app local, percorrer as rotas em 393, 900 e 1440 px e corrigir eventuais problemas visuais ou de interação antes de integrar ou publicar.
