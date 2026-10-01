# Movimento e estados

## Movimento

| Uso | Duração | Curva |
| --- | --- | --- |
| Hover, troca de cor | 100–150ms | padrão (0.2, 0, 0, 1) |
| Chips, chaves, segmentado | 200ms | padrão |
| Folha, diálogo entrando | 300–400ms | desaceleração enfatizada (0.05, 0.7, 0.1, 1) |
| Saindo | 200ms | aceleração enfatizada (0.3, 0, 0.8, 0.15) |
| Cartão → detalhe do livro | 400ms | container transform (Android), zoom navigation (iOS) |

No iOS, prefira as animações e molas do sistema. Com **Reduzir Movimento**, troque deslocamentos e zooms por fade de 150ms.

## Estados de componente

Todo controle interativo é desenhado em: **padrão, hover (Web), foco, pressionado, desativado** e, quando faz sentido, **selecionado, carregando e erro**. As opacidades estão em `state-*`.

## Estados de tela

Cada lista e tela de dados tem: **carregando** (esqueleto com a forma do conteúdo), **vazio** (explica e oferece uma ação: "Avisar quando aparecer"), **erro** (o que aconteceu e "Tentar novamente"), **offline** (mostra o que está salvo) e **parcial** (rascunho, aguardando envio).
