# Web e responsivo

## Classes de janela

| Classe | Largura | Navegação | Grade |
| --- | --- | --- | --- |
| Compacta | < 600 | Barra inferior (layout de celular) | 4 colunas, margem 16 |
| Média | 600–839 | Navigation rail | 8 colunas, margem 24, cartões em 2 colunas |
| Expandida | 840–1199 | Rail + lista e detalhe | 8–12 colunas |
| Grande | ≥ 1200 | Cabeçalho com busca e "Anunciar" | 12 colunas, margem 80, cartões em 4 colunas |
| Extra | ≥ 1600 | Igual à grande | Conteúdo até `content-max` (1280) centralizado |

## Padrões da Web

- **Cabeçalho** (`web-header` 72): logotipo, busca (até 520px), Explorar, Estante, botão "Anunciar", conversas e avatar. O destino atual tem sublinhado de 3px em `primary`.
- **Entrar:** duas colunas, painel da marca (640px) com o galho de ipê e a ilustração, formulário de 400px centralizado.
- **Explorar:** filtros na lateral (`sidebar-filters`), resultados em grade de 4 colunas com um cartão de alerta no fim.
- **Detalhe e encontro:** duas colunas; o resumo (livro, pessoa, segurança, ação principal) fica fixo à direita ao rolar.
- **Conversas:** três painéis (lista 360, conversa, detalhes 320). Abaixo de 1200px, o painel de detalhes vira gaveta.
- **Ponteiro e teclado:** todo controle tem estado de hover (`state-hover`) e foco visível (`focus-ring` 3px). Atalhos: `/` foca a busca, `Esc` fecha diálogos.
