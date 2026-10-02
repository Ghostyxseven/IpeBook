# iOS (iOS 26 · Liquid Glass)

O app no iPhone usa a linguagem da Apple, com a marca do IpêBook nas cores, na fonte serifada dos momentos-chave e no código de cor das modalidades.

## Liquid Glass

- **Onde:** só na camada de navegação, que flutua sobre o conteúdo: barra de abas, botões circulares da barra superior, barra de mensagem, controles sobre a câmera e sobre a capa do livro.
- **Onde não:** listas, cartões, campos e textos ficam em superfícies sólidas (`ios-cell`, `ios-grouped-background`). Vidro sobre vidro também não.
- **Receita:** `glass-fill` + desfoque de 22pt e saturação 180% + `glass-stroke` 0.5pt + `glass-shadow`. Sobre imagem ou câmera, `glass-fill-dark` com ícones brancos. No SwiftUI: `.glassEffect()` e `GlassEffectContainer`.
- Com **Reduzir Transparência** ligado, o vidro vira superfície sólida (`ios-cell`).

## Estrutura

- **Barra de abas flutuante** (`ios-tab-bar` 62pt): Início, Estante, Perfil; **Explorar é a aba de busca** (`Tab(role: .search)`), no círculo à direita. Some nas telas de fluxo.
- **Barra superior:** voltar em botão circular de vidro (44pt), título `ios-headline` centralizado; título grande (`ios-large-title`) em telas raiz, recolhendo ao rolar.
- **Listas agrupadas:** cantos `radius-ios-cell`, separador 0.5pt recuado 16pt, cabeçalho `ios-footnote` em maiúsculas e rodapé explicativo.
- **Modalidades:** controle segmentado nativo (Todos/Venda/Troca/Doação).
- **Folhas** com alça para escolhas no meio de um fluxo (Propor troca, Livro identificado), detents médio e grande, topo `radius-ios-sheet`.
- **Alertas** para ações destrutivas (Bloquear), com cancelar à esquerda.
- **Seletores nativos** de data e hora em pílula (`ios-fill`); menus pull-down para Conservação e Categoria.
- **Live Activity** e Dynamic Island no dia do encontro: livro, local, contagem regressiva, "Mensagem" e "Estou a caminho".

## Regras da App Store que afetam o design

- Se houver login com Google, ofereça **Entrar com a Apple** com o mesmo destaque, usando o botão oficial (`SignInWithAppleButton`).
- Peça localização, câmera e notificações só no momento do uso, com a tela de explicação antes do pedido do sistema.
- Denunciar e bloquear precisam estar a no máximo dois toques de qualquer perfil ou conversa.
