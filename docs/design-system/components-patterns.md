# Components e Patterns — IpêBook

## Regra de origem

Antes de criar um controle:

1. Procure na biblioteca nativa da plataforma.
2. Reuse tokens existentes.
3. Crie componente próprio apenas quando houver necessidade específica do produto.

### Plataforma

- Android: Material 3 / Material Symbols.
- iOS: componentes nativos e SF Symbols da biblioteca iOS do projeto.
- Web: wrappers responsivos que preservam a mesma semântica e os mesmos tokens.

## Componentes do produto

### Status Badge

Variantes: **Venda**, **Troca**, **Doação**, **Reservado** e **Concluído**.

O texto é obrigatório; a cor é reforço visual.

### Book Card

Conteúdo mínimo:

- capa;
- título;
- autor;
- modalidade;
- preço ou gratuidade quando aplicável;
- estado do exemplar;
- localização quando disponível.

Variantes principais: Venda, Troca e Doação.

### Empty State

Estados principais:

- nenhum resultado;
- offline;
- estante vazia.

Todo estado vazio deve explicar o motivo e oferecer um próximo passo claro.

## Componentes de interface

Botão, campo, busca, chips, navegação, dialog, sheet, snackbar e controles equivalentes devem vir prioritariamente da biblioteca da plataforma. Implemente os estados necessários: default, focus, pressed, disabled, loading, error, empty e offline.

## Patterns do produto

### Descobrir livro
Buscar → comparar resultados → abrir detalhe → agir.

### Publicar anúncio
ISBN/manual → dados do livro → modalidade → revisar → publicar.

### Combinar encontro
Conversar → escolher local público → escolher horário → confirmar resumo.

### Concluir negociação
Confirmar recebimento → marcar concluído → avaliar → registrar no histórico.

A IA deve reutilizar estes padrões antes de propor uma estrutura nova.
