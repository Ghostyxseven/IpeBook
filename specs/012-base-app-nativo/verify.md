# Verificação — 30/09/2026

## Resultado

Implementado na branch `feature/autenticacao`. O app Android/iOS tem Expo Router, tema nativo gerado dos tokens, componentes base e estados de feedback. A apresentação Web continua com entrada própria, mesmo comportamento e mesmo tamanho de JavaScript inicial.

## Evidências

- `npm run typecheck`: aprovado.
- `npm test`: 31 testes aprovados (15 anteriores + 16 novos). Os testes com jsdom agora rodam em qualquer máquina após `npm install`.
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

## Divergências e limitações

- **Não testado em aparelho ou emulador**: esta máquina não tem Android SDK nem simulador iOS. As telas foram renderizadas com react-native-web durante a avaliação da Web e conferidas em captura (390 × 844 e 1440 × 900). O teste no Expo Go fica pendente.
- **Figma não inspecionado**: a integração exige autenticação. Os componentes seguem `docs/design-system.md` e os tokens; a comparação com os quadros fica pendente.
- **Fonte**: Android usa a fonte do sistema (Roboto); iOS usa a fonte do sistema, sem carregar Roboto.
- **Ícones**: a opção Mostrar/Ocultar senha usa texto em vez de ícone, até a equipe escolher as bibliotecas Material Symbols e SF Symbols.
- **Novo token** `app.formMaxWidth` (480 px), para limitar a largura dos formulários em tablets.
- O roteiro `scripts/verificar-gesto-livro.mjs` falha na linha 90 tanto nesta branch quanto na `develop` no Chrome 154 headless (a emulação de toque não inicia a virada). Não é regressão desta branch.
