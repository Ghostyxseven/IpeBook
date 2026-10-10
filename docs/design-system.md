# Design System — IpêBook

**Versão:** 1.1  
**Fonte visual:** [Figma — IpêBook](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook-Mobile?node-id=20-207)  
**Arquivo oficial desde 02/10/2026** (substitui o anterior, `qSTmNLUhC6PwJlbyUmytbe`). Os IDs de nós citados em specs e documentos antigos pertencem ao arquivo anterior e precisam ser reconferidos no atual.  
**Contrato de implementação:** [`design-tokens.json`](../design-tokens.json)

O Design System do IpêBook mantém uma identidade única para Android, iOS e Web sem forçar componentes idênticos entre plataformas.

## Princípios

- clareza antes de decoração;
- conteúdo é protagonista;
- comportamento nativo por plataforma;
- confiança nas interações presenciais;
- acessibilidade por padrão.

## Fonte de verdade

| Camada                | Responsabilidade                                            |
| --------------------- | ----------------------------------------------------------- |
| Figma                 | decisões visuais, componentes e referência por plataforma   |
| `design-tokens.json`  | cores, tipografia, medidas, layout, motion e acessibilidade |
| `docs/design-system/` | regras de uso, patterns e governança                        |
| código                | implementação que consome o contrato                        |

Mudanças globais devem manter essas quatro camadas sincronizadas.

## Documentação

- [Foundations](design-system/foundations.md)
- [Components e Patterns](design-system/components-patterns.md)
- [Plataformas e Acessibilidade](design-system/platforms-accessibility.md)
- [IA e Governança](design-system/ai-governance.md)

## Identidade

O IpêBook deve parecer **acolhedor, humano, editorial, simples, confiável e local**.

Direção visual:

- fundo creme;
- superfícies claras;
- verde profundo para ações e navegação;
- amarelo-ipê como destaque;
- cantos suaves;
- capas e conteúdo dos livros como protagonistas.

Evite glow/neon, sombras pesadas, ícones decorativos sem função e aparência genérica de IA.

## Semântica do produto

### Venda

- preço em BRL;
- badge verde suave;
- texto “Venda”.

### Troca

- condições e interesse explícitos;
- amarelo-ipê como reforço;
- texto “Troca”.

### Doação

- gratuidade explícita;
- terracota suave;
- texto “Doação” ou “Grátis”.

### Reservado e Concluído

São estados do ciclo do anúncio, não modalidades. Sempre devem aparecer com texto legível, nunca somente por cor.

## Componentes próprios

O Figma possui componentes de produto reutilizáveis para:

- **IpêBook / Status Badge**
- **IpêBook / Book Card**
- **IpêBook / Empty State**

Controles de sistema como Button, Text Field, Search, Navigation, Dialog, Sheet e equivalentes devem vir prioritariamente das bibliotecas da plataforma.

## Plataforma

### Android

Material 3 + Material Symbols.

### iOS

Componentes nativos da biblioteca iOS do projeto + SF Symbols.

### Web

Layout responsivo, grid de 12 colunas, estados hover/focus e navegação por teclado.

No aplicativo em `/app`, a classe compacta usa a barra inferior; a média e a expandida usam navegação lateral; a larga usa cabeçalho persistente. Listas passam a 2 ou 4 colunas, conforme a largura, e páginas de leitura usam uma medida menor que o contêiner máximo de 1280 px. Os valores estão em `app.web` de `design-tokens.json` e seguem [Web e responsivo](design-system/referencia/web.md). A implementação e os limites de validação estão na [spec 040](../specs/040-web-responsiva/spec.md).

O objetivo é **equivalência de experiência, não cópia pixel a pixel**.

## Acessibilidade

- alvo de toque mínimo de 48 × 48 px;
- foco visível na Web;
- rótulos acessíveis para icon buttons;
- estados não dependem somente de cor;
- erros explicam o problema e a correção;
- layouts toleram texto ampliado;
- movimento reduzido é respeitado.

## Conteúdo

Use português do Brasil e CTAs específicos:

- “Explorar livros”
- “Publicar anúncio”
- “Enviar mensagem”
- “Confirmar encontro”
- “Salvar alterações”

Evite CTAs vagos quando houver uma ação específica.

## Página institucional

A página institucional Web possui decisões específicas registradas nas especificações `001` a `011`. Essas decisões **não são foundations globais do Design System**.

Tokens específicos da apresentação permanecem sob `landing.*` por compatibilidade, enquanto as regras globais ficam nas categorias `color`, `spacing`, `radius`, `border`, `opacity`, `motion`, `layout`, `accessibility`, `platform` e `typography`.

## Ao criar uma nova tela

1. Identifique Android, iOS ou Web.
2. Consulte o quadro correspondente no Figma.
3. Reutilize tokens.
4. Reutilize componentes nativos e componentes próprios do IpêBook.
5. Reutilize patterns documentados.
6. Verifique estados e acessibilidade.
7. Registre divergências no PR.

## Componentes do aplicativo (Android e iOS)

A [spec 013](../specs/013-base-app-nativo/spec.md) cria a base React Native usada pelas features. `src/view/theme/nativeTheme.ts` lê `design-tokens.json` e escolhe por `Platform.select` a altura de controle, os raios e a margem de página de cada plataforma. Os componentes não repetem hexadecimais nem medidas.

| Componente      | Local                  | Comportamento                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`        | `components/ui/`       | Android e Web seguem o "Botão" do Figma IpêBook-Mobile (ADR 0013): pílula (`radius.full`), rótulo `typography.labelLarge` e variantes primária (Preenchido), secundária (Contornado), texto e `danger` (Perigo, texto em `color.error`). Carregando mostra indicador e bloqueia toque; inativo usa `state.disabled*` em todas as variantes; alvo mínimo de 48 × 48. iOS (ADR 0024): cápsula de 50 px, rótulo `typography.iosBody`; secundária sem borda. |
| `TextField`     | `components/ui/`       | Android e Web seguem o "Campo" do Figma (ADR 0013): contornado, rótulo `labelMedium` dentro da caixa, valor `bodyLarge`, raio `radius.medium`, espaçamento 16/12. Erro com borda de 2 px, ícone `AppIcon` "error" e mensagem; o leitor de tela ouve "Erro: …". Tocar na caixa foca o campo; Mostrar/Ocultar senha com nome acessível. iOS (ADR 0024): rótulo `iosFootnote` acima, célula `color.ios.cell` com raio 12, borda só no foco e no erro.       |
| `FormMessage`   | `components/ui/`       | Aviso do formulário inteiro (erro do servidor ou confirmação), com título e faixa lateral de cor, anunciado a leitores de tela.                                                                                                                                                                                                                                                                                                                          |
| `AuthLayout`    | `components/ui/`       | Telas de acesso do Figma (seção 01 · Acesso): logotipo opcional, título `brandDisplay` com trecho destacado em `tertiaryContainer`, descrição `bodyLarge`, formulário e rodapé. Cuida de área segura, rolagem, teclado e largura máxima `app.formMaxWidth` (480 px).                                                                                                                                                                                     |
| `Wordmark`      | `components/ui/`       | Logotipo tipográfico "IpêBook" em `brandWordmark` e `brandBrown`, com traço `brandAmber` de 36 × 4 px.                                                                                                                                                                                                                                                                                                                                                   |
| `Checkbox`      | `components/ui/`       | Item de lista com caixa de seleção (Figma 01.03): linha inteira tocável com 48 px, ícone `checkboxOn`/`checkboxOff`, texto de apoio e erro anunciado.                                                                                                                                                                                                                                                                                                    |
| `LoadingState`  | `components/feedback/` | Indicador e texto centralizados (Figma 10.01).                                                                                                                                                                                                                                                                                                                                                                                                           |
| `ErrorState`    | `components/feedback/` | Figma 10.02 e 10.03: centralizado, círculo de 96 px com ícone de erro, título, explicação e "Tentar novamente" em largura total. `tone="error"` usa `color.errorContainer` e título 24/32; `tone="offline"` usa `container.high` e o título de marca. Ação de apoio opcional em botão de texto (ex.: "Ver favoritos").                                                                                                                                   |
| `EmptyState`    | `components/feedback/` | Figma 02.14: sem cartão, título de marca `brand.title` (Source Serif 4, 24/29), explicação e a ação principal (botão preenchido).                                                                                                                                                                                                                                                                                                                        |
| `OfflineBanner` | `components/feedback/` | Figma 10.02: Android e Web em cartão escuro (`color.inverseSurface`) com ícone de erro; iOS em faixa amarela (`color.highlight`) com ícone de informação. Aparece nos grupos `(auth)` e `(app)` e mantém "Tentar novamente" no aviso, porque também cobre formulários.                                                                                                                                                                                   |

Divergências registradas no [verify](../specs/013-base-app-nativo/verify.md) e em [divergências](design-system/divergencias.md): Mostrar/Ocultar em texto (o Figma não define o controle); iOS com a fonte do sistema; altura de 52 px e raio de 12 px do Figma ainda diferentes dos tokens.
