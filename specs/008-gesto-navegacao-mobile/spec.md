# Ocultação de Botões no Mobile e Indicação de Gesto de Deslizar

## Escopo

Ajustar a experiência de navegação do livro institucional (`BookPresentation`) em telas móveis (`<= 760px`):

1. Ocultar os botões de navegação fixos "Anterior" e "Próxima" (`.book-turn`), liberando altura e respiro vertical na tela do celular.
2. Adicionar uma indicação visual e acessível no mobile de que o leitor pode simplesmente deslizar horizontalmente para navegar entre os capítulos ("só deslizar").
3. Reduzir a altura da barra inferior no mobile e ajustar o padding inferior das páginas para eliminar espaço vazio desnecessário.
4. Manter o gesto de toque/swipe horizontal 100% funcional e responsivo.
5. Preservar intactos os botões "Anterior" e "Próxima" e o comportamento completo na versão desktop.

## Aceite

1. Em telas móveis (`<= 760px`), os botões `.book-turn` ("Anterior" e "Próxima") não são exibidos (`display: none`).
2. É exibida no mobile uma barra de status leve e acessível contendo:
   - A barra de progresso dourada contínua (`.book-progress`).
   - Um indicador de gesto visual discreto e intuitivo (ex: setas sutis e texto amigável como "Deslize para navegar" ou "← Deslize para navegar →").
   - O contador de páginas atual (`01 / 07`, `04 / 07`, etc.) ou dots visuais.
3. A altura da barra inferior no mobile é reduzida (ex: 44px em vez de 72px) e o padding inferior das páginas em `.reader-chapter` é recalculado para não desperdiçar altura de tela.
4. A navegação por deslizar com o dedo (touch swipe horizontal) continua funcionando suavemente em todo o palco (`.book-stage`).
5. Leitores de tela e tecnologias assistivas continuam informados sobre o progresso e a navegação (`aria-label`, `aria-live="polite"`).
6. Em telas maiores (`> 760px`), os botões "Anterior" e "Próxima" continuam presentes e funcionais como antes.
