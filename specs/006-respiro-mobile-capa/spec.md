# Respiro e Ergonomia Mobile da Apresentação do Livro

## Escopo

Corrigir as margens laterais coladas na visualização mobile de `InstitutionalBook`, ajustar a densidade vertical e dar respiro harmônico para título, botões de ação e ilustração 3D do livro em celulares.

## Aceite

1. Margens laterais móveis restauradas e confortáveis (mínimo 20px a 24px), sem cortes de texto ou colisão de caracteres ("U", "v", "e") com a borda da tela.
2. Eliminar o uso de tokens CSS inválidos (`--spacing-20`, `--spacing-6`) ou garantir sua definição com valores seguros.
3. Botões de ação principais ("Quero comprar →" e "Quero vender") mantêm alvos de toque acessíveis (mínimo 48px de altura) com respiro interno e espaçamento sem compressão excessiva.
4. Ilustração 3D da capa encadernada (`.bound-book`) em celular redimensionada proporcionalmente (escala mais leve e compacta), preservando espaço para leitura e rolagem suave.
5. Tipografia do título hero no mobile com tamanho e entrelinha equilibrados (`clamp(26px, 7vw, 34px)`).
6. Sem overflow horizontal nas páginas do livro em celulares (320px a 430px).
