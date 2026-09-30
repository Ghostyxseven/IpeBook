# Respiro e Layout Mobile da Estante de Livros

## Escopo

Ajustar a exibição da Estante de Livros (`#em-construcao` / `shelf-chapter`) em dispositivos móveis, eliminando o esmagamento de 3 colunas de livros simultâneas na tela do celular e reorganizando os filtros e campo de busca para uso touch ergonômico.

## Aceite

1. No mobile (`<= 768px`), a grade `.example-grid` deixa de forçar 3 colunas espremidas e passa a exibir cards legíveis e confortáveis em 1 coluna (com capa bem dimensionada e informações completas sem cortes).
2. Os títulos dos livros dentro das capas ("O jardim das palavras", "Caminhos de sol", "Um mundo no quintal") são legíveis e sem cortes de palavras ou letras.
3. A barra de ferramentas da estante (`.shelf-tools`) se reorganiza verticalmente:
   - Campo de busca ocupa a largura total com altura touch de pelo menos 48px.
   - Filtros de modalidade ("Todos", "Venda", "Troca", "Doação") se distribuem de forma acessível e fácil de tocar.
4. Preservação da rolagem interna da folha e de alvos de toque de 48px para o botão "Conhecer o exemplo".
5. Na versão desktop, a grade permanece com 3 colunas e alinhamento original.
