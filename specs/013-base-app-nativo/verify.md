# Verificação — 30/09/2026

## Resultado

Implementado na branch `feature/autenticacao`. O app Android/iOS tem Expo Router, tema nativo gerado dos tokens, componentes base e estados de feedback. A apresentação Web continua com entrada própria, mesmo comportamento e mesmo tamanho de JavaScript inicial.

## Evidências

- `npm run typecheck`: aprovado.
- `npm test`: 35 testes aprovados (19 anteriores, incluindo o contrato do design system, + 16 novos). Os testes com jsdom agora rodam em qualquer máquina após `npm install`.
- `npm run build:web`: exportação sem erros; um único arquivo JS de 112 KB gzip, contra 112 KB na `develop`.
- `npx expo export --platform android --platform ios`: bundles gerados sem erros (iOS com 1.235 módulos, Android com 1.380).
- `node scripts/verificar-recursos-web.mjs`: aprovado (zoom, WOFF2, robots/llms, 404 para arquivos ausentes).
- Chrome via CDP na exportação final: `/` e `/#privacidade` sem exceções, rolagem do documento preservada, aviso de "Criar conta" abrindo o diálogo, `/entrar` respondendo 404 na Web (não há rotas do app no site).

## Medição do impacto do roteador na Web

Chrome 154 headless, servidor local com gzip, celular 390 × 844, CPU 4× mais lenta, rede de 150 ms e 1,6 Mbps, três execuções:

| Variante                         | JS (gzip) | LCP (execuções)          |
| -------------------------------- | --------: | ------------------------ |
| `develop`                        |    112 KB | 2.616 / 2.028 / 1.840 ms |
| Web sob Expo Router (descartada) |    402 KB | 5.792 / 5.088 / 5.204 ms |
| Esta branch (Web sem roteador)   |    113 KB | 3.096 / 1.864 / 1.856 ms |

A primeira execução de cada série inclui aquecimento do navegador. A decisão está no ADR 0005.

## Problemas encontrados e corrigidos durante a verificação

- Sob o Expo Router, a apresentação institucional perdia a rolagem do documento (contêiner com altura 0). O problema deixou de existir com a Web fora do roteador.
- `TextField` media 46 px de altura por causa da borda; a altura mínima foi movida para o campo de texto e a borda de foco compensada com margem negativa.

## Issue #9: componentes Android em Material 3 (01/10/2026)

**Referência:** Figma IpêBook-Mobile, página "05 · Componentes": "Botão" (18:60) e "Campo" (18:73), lidos com o MCP do Figma (`get_design_context` e capturas). O arquivo ainda não tem as páginas de telas (06 Android, 07 iPhone, 08 Web); por isso, nesta issue, a referência são os componentes.

| Componente    | Figma                                                                                   | Antes                                                  | Depois (Android e Web)                                                             |
| ------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Botão         | pílula; 52 px (texto 48); rótulo 14/20 peso 500; Preenchido, Contornado, Texto e Perigo | raio de 16 px, 56 px, rótulo 16 px negrito, sem Perigo | pílula (`radius.full`), rótulo `labelLarge`, variante `danger`, texto com 48 px    |
| Contornado    | borda `outline`, fundo transparente                                                     | borda verde, fundo de superfície                       | borda `color.border`, fundo transparente                                           |
| Campo         | rótulo de 12 px dentro da caixa, 16/12, raio médio                                      | rótulo fora da caixa, raio de 16 px                    | rótulo `labelMedium` dentro, `radius.medium`, 16/12; toque na caixa foca o campo   |
| Erro do campo | borda de 2 px, ícone e mensagem                                                         | borda e o texto "Erro: …"                              | borda de 2 px, ícone `AppIcon` "error" e mensagem; o leitor de tela ouve "Erro: …" |

**Defeito encontrado e corrigido:** no botão principal carregando ou desabilitado, o texto ficava claro sobre o fundo de desabilitado, ilegível. Agora todas as variantes inativas usam `state.disabledText`.

**Evidência:** prévia temporária dos componentes renderizada com react-native-web no Chrome 154 (a Web usa o mesmo visual do Android), comparada com as capturas do Figma: estados padrão, erro, dica, senha, carregando e desabilitado. A prévia não foi versionada.

**Decisão:** sem biblioteca de componentes (ADR 0013). Novo token `typography.scale.labelLarge`. As diferenças de valor (52 px, raio de 12 px, cores) estão em `docs/design-system/divergencias.md`.

**Comandos:** `npm run typecheck`, `npm test` (89 aprovados), exportação Android e iOS e build Web.

**Pendente:** validar pressionado, foco do teclado, TalkBack e texto ampliado num aparelho Android (issue #12). O iOS não mudou (issue #10).

## Issue #35: estados do sistema × Figma (03/10/2026)

**Referência:** Figma IpêBook, página "06 · Android / Material 3" (`0:1`), seção "10 · Estados do sistema" (`206:3641`): 10.01 Explorar carregando (`28:779`), 10.02 Sem conexão (`28:901`) e 10.03 Erro ao carregar (`28:997`); iPhone na seção `206:6941`. Estado vazio: 02.14 Favoritos · vazio (`254:4129`). As páginas de telas não aparecem na lista de páginas do arquivo, mas abrem pelo `node-id`.

| Componente                 | Figma                                                                                                            | Antes                                                     | Depois                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `LoadingState`             | indicador e "Carregando livros…"                                                                                 | igual                                                     | sem mudança                                                          |
| `ErrorState` (erro)        | centralizado; círculo de 96 px em `error-container` com ícone; título 24/32; texto 16/24; botão em largura total | cartão com faixa vermelha à esquerda, alinhado à esquerda | igual ao Figma, com `tone="error"`                                   |
| `ErrorState` (sem conexão) | círculo neutro, título de marca 30/36, "Tentar novamente" e "Ver favoritos"                                      | sem variante                                              | `tone="offline"` e `secondaryAction`; usado na abertura sem internet |
| `OfflineBanner`            | Android: cartão `inverse-surface` com ícone de erro; iOS: faixa amarela com ícone de informação                  | faixa escura de ponta a ponta, sem ícone                  | cartão por plataforma, com ícone                                     |
| `EmptyState`               | sem cartão; título de marca 24/29; botão preenchido                                                              | cartão com título 24/32 e botão contornado                | igual ao Figma                                                       |

**Tokens adicionados:** `color.errorContainer` (#F9DEDC), `color.inverseSurface` (#322F2B), `color.inverseOnSurface` (#F5EFE8) e `typography.brand.title` (24/29), todos com o mesmo valor da referência e do Figma.

**Divergências mantidas:** título do erro com peso 500 (`titleLarge`), em vez de 400; o `OfflineBanner` mantém "Tentar novamente", que o quadro não tem, porque o aviso também cobre formulários; o carregamento do iPhone (10.01) usa esqueleto, que fica com o catálogo; não há quadro equivalente ao antigo 43 "Estante sem conexão".

**Evidência:** prévia temporária com react-native-web no Chrome (visual do Android), comparada com as capturas do Figma. Os componentes são usados também pelo catálogo, pelos anúncios, pela negociação e pelos avisos; os testes dessas telas continuam aprovados (209).

## Divergências e limitações

- **Não testado em aparelho ou emulador**: esta máquina não tem Android SDK nem simulador iOS. As telas foram renderizadas com react-native-web durante a avaliação da Web e conferidas em captura (390 × 844 e 1440 × 900). O teste no Expo Go fica pendente.
- **Figma não inspecionado**: a integração exige autenticação. Os componentes seguem `docs/design-system.md` e os tokens; a comparação com os quadros fica pendente.
- **Fonte**: Android usa a fonte do sistema (Roboto); iOS usa a fonte do sistema, sem carregar Roboto.
- **Ícones**: a opção Mostrar/Ocultar senha usa texto em vez de ícone, até a equipe escolher as bibliotecas Material Symbols e SF Symbols.
- **Novo token** `app.formMaxWidth` (480 px), para limitar a largura dos formulários em tablets.
- O roteiro `scripts/verificar-gesto-livro.mjs` falha na linha 90 tanto nesta branch quanto na `develop` no Chrome 154 headless (a emulação de toque não inicia a virada). Não é regressão desta branch.
- **Controles de sistema**: a versão 1.1 do design system (PR #6, integrada por rebase) recomenda que Button e Text Field venham das bibliotecas de cada plataforma (Material 3 no Android, componentes nativos no iOS). `Button` e `TextField` desta spec são próprios, construídos só com React Native e com os tokens. Adotar uma biblioteca de componentes, como React Native Paper, é uma decisão para a equipe registrar em ADR; a troca fica isolada nesses dois componentes.
- Após o rebase sobre o PR #6, o tema nativo passou a ler os tokens estruturados (`$value`) e a usar `accessibility.touchTarget`, `accessibility.focusWidth`, `accessibility.focusOffset`, `border.thin` e `border.strong` em vez de números fixos.

## Issue #10: componentes do iPhone nas telas de acesso (03/10/2026)

**Fonte:** Figma, página 07 · iPhone, seção 01 · Acesso (`206:6868`), quadros 01.03, 01.10 e 01.17 e variáveis `cor/ios-cell`, `cor/ios-secondary-label`, `cor/ios-separator` e `iOS/ios-*`. Decisão no [ADR 0024](../../docs/adr/0024-componentes-ios-da-autenticacao.md).

| Componente      | Antes no iPhone                    | Agora (Figma iOS)                                         |
| --------------- | ---------------------------------- | --------------------------------------------------------- |
| `TextField`     | rótulo em negrito, caixa com borda | rótulo `ios-footnote` acima, célula `ios.cell`, raio 12   |
| `Button`        | raio 20, rótulo em negrito         | cápsula de 50 px, rótulo `ios-body`; secundário sem borda |
| `Checkbox`      | caixa de seleção do Material       | linha agrupada com ícone e `Switch` (UISwitch)            |
| `RadioListItem` | rádio do Material                  | lista agrupada com cabeçalho, separador e `checkmark`     |

**Evidência:** prévia Web com os ramos do iOS forçados de propósito (cópia temporária com `Platform.OS` fixo e os tokens do iOS, desfeita depois) das telas Entrar, Criar conta e Seu bairro, comparada com os quadros do iPhone. O `expo export --platform ios` gerou o pacote sem erro.

**Não verificado (precisa de iPhone ou simulador, issue #12):** VoiceOver (ordem de leitura e anúncio da chave e da marca de seleção), texto ampliado, teclado aberto, preenchimento automático de senha e código de uso único, e largura em iPad. A #10 continua aberta até essa validação.
