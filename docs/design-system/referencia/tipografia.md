# Tipografia

O IpêBook usa **duas vozes**: uma serifada, de livro, para a marca e os momentos de começo e fim; e uma sem serifa, neutra, para toda a interface. Cada plataforma usa a sua escala nativa, para o app parecer de casa em cada uma.

## Famílias

| Papel | Família | Onde | Pesos |
| --- | --- | --- | --- |
| Marca | Source Serif 4 (`--font-serif`) | Logotipo, títulos de entrada, confirmações, herói da Web | 600, 700 |
| Interface Android e Web | Roboto Flex (`--font-sans`) | Todo o resto | 400, 500, 600, 700 |
| Interface iOS | SF Pro, fonte do sistema (`--font-ios`) | Todo o resto no iPhone e iPad | Regular, Semibold, Bold |
| Códigos | Roboto Mono (`--font-mono`) | ISBN | 400 |

SF Pro não é distribuída com o app: no iOS use sempre a fonte do sistema (`.body`, `.headline`…), que já traz Dynamic Type e ajustes óticos. Source Serif 4 e Roboto Flex são de licença aberta (OFL) e podem ser embarcadas no Android e servidas na Web.

## Escalas

- **Marca:** `brand-display-xl` 56 → `brand-title` 24, sempre em 700 com espaçamento negativo leve. No máximo **um** título serifado por tela.
- **Android:** escala completa do Material 3 (`m3-display-lg` … `m3-label-sm`), sem alterar tamanhos.
- **iOS:** estilos do Dynamic Type no tamanho padrão (Large): `ios-large-title` 34 … `ios-caption-2` 11. No código, use os estilos de texto do sistema, não tamanhos fixos.
- **Web:** `web-h1` 36 (serifada) … `web-caption` 12; texto corrido com 16/26.

## Regras

1. **Hierarquia por tamanho e peso, não por cor.** Texto secundário usa `on-surface-variant` (ou `ios-secondary-label`), nunca cinza mais claro que isso.
2. **Mínimos:** 12px no Android e na Web, 11pt no iOS (`ios-caption-2`), e só para informação de apoio. Texto que precisa ser lido: 14px ou mais.
3. **Linha:** texto corrido entre 45 e 75 caracteres (`measure-max`). Na Web, nunca deixe parágrafos ocuparem a largura toda.
4. **Entrelinha:** 1,4–1,6 para texto corrido; 1,1–1,2 para títulos grandes.
5. **Caixa:** frases normais, só com inicial maiúscula ("Combinar encontro"). Maiúsculas só em sobretítulos curtos (`web-caption`, cabeçalho de grupo do iOS), com espaçamento de +0,4 a +1px.
6. **Números:** preços, horas e contagens com algarismos tabulares (`font-variant-numeric: tabular-nums`; no iOS `.monospacedDigit()`). Formato brasileiro: R$ 25,00 · 10h · 03/10 · 4,8.
7. **Marca-texto:** o realce `tertiary-container` vai atrás da **segunda** linha do título de marca, com raio `radius-sm`, nunca em texto corrido.
8. **Truncamento:** títulos de livro quebram em até 2 linhas e depois usam reticências; nomes de pessoas nunca são cortados no meio.
9. **Hifenização:** desligada em títulos; ligada em texto corrido longo na Web (`hyphens: auto`, `lang="pt-BR"`).
10. **Fonte grande:** tudo precisa funcionar com Dynamic Type até AX3 (iOS) e escala de fonte 200% (Android e Web). Telas rolam; botões crescem em altura; nada é cortado.
