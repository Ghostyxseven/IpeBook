# Instruções para agentes de IA — IpêBook

Este repositório usa o [design system](docs/design-system.md) e os [tokens](design-tokens.json) como contrato visual. Consulte também o [arquivo Figma](https://www.figma.com/design/qSTmNLUhC6PwJlbyUmytbe?node-id=0-1) antes de implementar telas.

## Ao escrever ou revisar interface

1. Identifique a plataforma da tela: Android, iOS ou Web. Use o mesmo fluxo e conteúdo, com componentes e navegação próprios da plataforma. Android segue Material 3; iOS usa padrões nativos; Web usa layout responsivo e navegação persistente quando houver espaço.
2. Consuma `design-tokens.json` por meio de constantes, tema ou variáveis CSS. Evite hexadecimais e medidas duplicados em componentes. Os valores de raio, altura de controle e margem de página variam por plataforma.
3. Reutilize componentes de botão, campo, cartão de livro, selo de modalidade, navegação e feedback. Implemente estados padrão, foco, erro, desabilitado, carregando, vazio e offline quando aplicáveis.
4. Preserve o significado de **Venda**, **Troca** e **Doação**. Preço em BRL aparece só em venda; doação indica gratuidade; troca mostra o que se busca e o acordo possível.
5. Use português do Brasil. Textos, dados de exemplo, vendedores, avaliação, preço, disponibilidade e bairros não devem ser apresentados como dados reais sem fonte.
6. Garanta alvos de toque de pelo menos 48 × 48 px, rótulos acessíveis para ícones, foco visível na Web, ordem de leitura coerente e estados que não dependam somente de cor.
7. Ao alterar um padrão visual, atualize os tokens e a documentação no mesmo PR. Registre divergências em relação ao Figma e o motivo.
8. Antes de concluir, confira a tela em tamanho de celular e Web, fluxos de entrada, descoberta, detalhe e contato, além dos estados de erro e vazio. Não trate links do protótipo como integração de backend.

O Figma contém as páginas Android (`0:1`), iPhone (`33:94`) e Web (`33:95`) com a mesma cobertura de 66 telas em cada plataforma. O número 52 não faz parte da sequência atual. A documentação do repositório não substitui a inspeção do quadro correspondente ao implementar detalhes de uma tela.
