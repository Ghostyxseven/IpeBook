# Verificação — aplicativo Web responsivo

**Data:** 10/10/2026

**Branch de trabalho:** `feature/web-responsiva` em `/tmp/ipebook-web-responsiva`.

## Resultado local

- `npm run verify`: passou (typecheck, lint, formatação e 41 arquivos de testes, sem falhas).
- `npm run build:web`: passou; exportou a apresentação em `dist/` e o aplicativo em `dist/app/`.
- `git diff --check`: passou.
- Chromium headless, sem Playwright, com a exportação local: cadastro em 1440 × 900 mostra composição em duas colunas; em 393 × 852 mantém a composição compacta e rolagem vertical. A tela inicial em 1440 × 900 também ocupa duas colunas. Capturas do cadastro: [desktop](assets/cadastro-desktop.png) e [celular](assets/cadastro-celular.png).
- A primeira execução da CI falhou em `tests/moderation.test.mjs`: duas denúncias criadas no mesmo milissegundo não tinham ordem garantida, mas o teste exigia uma posição fixa. O teste foi ajustado para localizar cada denúncia pelo alvo e preservar as asserções sobre nomes e estado. `node --test tests/moderation.test.mjs` e `npm run verify` passaram após o ajuste; a nova execução da CI deve confirmar o resultado remoto.

## Limites da verificação

- O navegador pessoal não estava conectado à ferramenta de inspeção. A captura enviada pelo usuário representa a versão publicada anterior; esta branch ainda não foi publicada.
- Não havia uma sessão autenticada no navegador local. A navegação lateral/cabeçalho, listas, detalhes e conversas passaram por revisão de código, teste dos breakpoints e build, mas ainda requerem inspeção visual e funcional do fluxo autenticado, incluindo teclado, foco e estados vazios.
- O quadro Web do Figma não ficou acessível nesta sessão. Foram usados os tokens e a cópia local da referência Web do design system. A comparação final com o Figma segue pendente.
- Android e iOS não foram executados nesta validação. A seleção de composição depende de `Platform.OS === 'web'`, e o teste automatizado cobre a classe compacta nas plataformas nativas.

## Próximo passo

Conectar um navegador com sessão de teste do app local, percorrer as rotas em 393, 900 e 1440 px e corrigir eventuais problemas visuais ou de interação antes de integrar ou publicar.
