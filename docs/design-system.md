# Design system — IpêBook

**Fonte:** [Figma — IpêBook, proposta mobile e design revisado](https://www.figma.com/design/qSTmNLUhC6PwJlbyUmytbe?node-id=0-1) · páginas Android `0:1`, iPhone `33:94`, Web `33:95`.  
**Implementação:** [`design-tokens.json`](../design-tokens.json) contém os valores reutilizáveis. Este documento descreve seu uso.

O IpêBook ajuda pessoas de Piripiri, PI, a descobrir livros para venda, troca e doação e combinar a entrega presencial. A interface deve ser acolhedora, legível e consistente entre plataformas.

## Cores

| Papel | Token | Valor |
| --- | --- | --- |
| Fundo | `color.background` | `#F6F1E8` |
| Superfície | `color.surface` | `#FCFAF6` |
| Texto principal | `color.text` | `#3C302A` |
| Texto secundário | `color.secondaryText` | `#645B55` |
| Ação principal | `color.action` | `#426B55` |
| Ação profunda | `color.actionDeep` | `#2F503D` |
| Superfície suave | `color.soft` | `#E7F0EA` |
| Borda | `color.border` | `#8F8478` |
| Marrom | `color.brown` | `#8A5945` |
| Sucesso | `color.success` | `#2F6B4F` |
| Erro | `color.error` | `#B3382C` |
| Dourado | `color.gold` | `#D99719` |
| Destaque | `color.highlight` | `#F4B942` |

Use fundo na área da página, superfície em cartões e campos, texto principal para conteúdo, verde para a ação prioritária e vermelho somente para erro. Capas de livros podem usar cores editoriais próprias; não transformá-las em novas cores da interface. Os tokens de foco, erro, desabilitado, hover e pressionado reproduzem os aliases atuais do Figma. Hover e pressionado compartilham `#E7F0EA` na fonte; a implementação pode acrescentar feedback de elevação ou animação sem criar uma cor arbitrária.

### Modalidades

| Modalidade | Fundo | Texto | Regra de conteúdo |
| --- | --- | --- | --- |
| Venda | `#E7F0EA` | `#2F503D` | Mostrar preço formatado em BRL. |
| Troca | `#F4B942` | `#3C302A` | Indicar interesse e condições; chip suave `#FBF0D0`. |
| Doação | `#F2E3DA` | `#7A4430` | Mostrar “Grátis”/“Doação”, sem preço fictício. |

O texto do selo e o ícone devem reforçar a modalidade; nunca depender apenas da cor.

## Tipografia e medidas

A família dos estilos IpêBook no Figma é **Roboto**. A interface do sistema operacional usa a tipografia nativa quando seu componente nativo a exigir.

| Estilo | Peso | Tamanho / entrelinha |
| --- | ---: | --- |
| Legenda | 400 | 12 / 16 px |
| Corpo | 400 | 16 / 24 px |
| Ação | 700 | 16 / 24 px |
| Seção | 700 | 24 / 32 px |
| Título | 700 | 32 / 40 px |

Escala de espaçamento: `0, 4, 8, 12, 16, 24, 32, 48, 56 px`. Prefira a escala; preserve respiro de 24 px entre grupos principais. O tamanho visual de um chip pode ser menor que seu alvo de toque.

| Medida | Android | iOS | Web |
| --- | ---: | ---: | ---: |
| Raio de campo | 16 px | 20 px | 14 px |
| Raio de cartão | 18 px | 22 px | 18 px |
| Raio de navegação | 16 px | 28 px | 18 px |
| Altura de controle | 56 px | 52 px | 48 px |
| Margem de página | 24 px | 24 px | 32 px |

Esses valores vêm das variáveis locais `IpêBook / Interface`, com modos Android, iOS e Web. Não escale uma captura de Android para produzir a versão de iPhone ou Web.

## Componentes

| Componente | Conteúdo e comportamento |
| --- | --- |
| Navegação | Destaque da seção atual, ícone e rótulo consistentes; áreas clicáveis de 48 × 48 px; voltar retorna ao contexto correto. |
| Botão | Variante primária verde, secundária contornada e texto; rótulo com verbo claro, estados de foco, pressionado, carregamento e desabilitado. Uma ação primária por área de decisão. |
| Campo e busca | Rótulo persistente, dica somente quando vazio, validação próxima do campo, teclado adequado; filtros selecionados visíveis e removíveis. |
| Cartão de livro | Capa, título, autor, modalidade, preço ou gratuidade, estado do livro e localização quando disponíveis. Priorize leitura do título e modalidade; não substitua dados ausentes por invenções. |
| Selo de modalidade | Venda, Troca ou Doação com as cores acima e texto legível. Use a mesma semântica em lista, detalhe e publicação. |
| Estados de feedback | Carregando, vazio, offline, erro e sucesso com mensagem concreta e próxima ação; preservar informações preenchidas quando houver recuperação. |
| Perfil e confiança | Identidade, localização e informações verificadas quando existirem; não fabricar notas, selos ou contagens. |
| Segurança e confirmação | Explicar denúncia, bloqueio e confirmação de ações; uma ação destrutiva deve ser identificada com clareza. |

### Ícones

Use **uma família por plataforma**: Material Symbols/Material 3 no Android, SF Symbols ou a biblioteca iOS do projeto no iPhone, e uma família vetorial coerente na Web. Mantenha significado e peso visual uniformes, com ícones equivalentes para buscar, explorar, favoritos, anunciar, mensagens e perfil. Dê nome acessível a ações só com ícone. Não misture ícones preenchidos e contornados aleatoriamente; selecione o estado ativo deliberadamente.

## Regras por plataforma

- **Android:** componentes e navegação Material 3, respeitando áreas seguras, barra de sistema e gesto de voltar. Altura padrão de controle 56 px.
- **iPhone:** controles, barra de abas e padrões de retorno nativos; respeitar safe areas e teclado. Altura padrão de controle 52 px.
- **Web:** shell responsivo, navegação persistente no desktop, largura de leitura confortável e uso de teclado com foco visível. A página do Figma representa desktop de 1440 px; adaptar para larguras menores sem cortar conteúdo. Altura padrão de controle 48 px.

As três páginas do Figma têm 66 telas cada, numeradas 01–51 e 53–67. Mantenha os fluxos equivalentes entre plataformas, mas adapte sua apresentação. O número 52 está ausente no arquivo atual.

## Experiência e acessibilidade

- Fluxos prioritários: entrar/criar conta → descobrir → filtrar/buscar → detalhe do livro → contato/acordo; anunciar livro → selecionar modalidade → revisar e publicar.
- Na tela **Entrar**, dê destaque à ação principal, rótulos reais nos campos, mostrar/ocultar senha com nome acessível, recuperação de senha e erros acionáveis. Preserve os dados digitados ao validar.
- Em **Descobrir**, mostre localização de forma entendível, busca e filtros próximos dos resultados, modalidade identificável e estado vazio com ajuste de filtro.
- Use português do Brasil, moeda `pt-BR` e termos consistentes. Trate bairros, preços e perfis de protótipo como exemplos.
- Alvos de toque: mínimo de **48 × 48 px**; ícones decorativos ficam fora da árvore acessível. Respeite ampliação de texto, contraste, leitura por tecnologia assistiva e navegação por teclado na Web.
- Para estados de erro e offline, explique o que aconteceu e ofereça “Tentar novamente” ou outra saída relevante. Não prometer funcionalidade de rede a partir de um link de protótipo.

## Manutenção

Ao criar ou revisar uma tela: confira o quadro correspondente no Figma; utilize os tokens; implemente componentes e estados compartilhados; verifique Android, iPhone e Web; documente no PR divergências justificadas. Se uma decisão de design mudar, atualize este documento e `design-tokens.json` junto com o código.
