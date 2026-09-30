# Verificação — Ocultação de Botões no Mobile e Indicação de Deslizar

## Procedimento de Teste

1. **Testes automatizados unitários**:
   - Comando executado: `npm test`
   - Resultado: 7 testes aprovados sem erros.
     - `guia, busca vazia, recuperação e detalhes respeitam a navegação` (OK)
     - `busca por título ou categoria ignora acentos, espaços e caixa` (OK)
     - `preço só pertence à venda; doação e troca mantêm seus significados` (OK)
     - `documentos legais abrem por endereço e fragmentos da página não viram documentos` (OK)
     - `conteúdo delimita operação e identifica pendências sem contato inventado` (OK)
     - `segurança resolve por endereço e os documentos distinguem demonstração de operação` (OK)
     - `navegação preserva destinos e fecha estados transitórios` (OK)

2. **Validação visual responsiva mobile (390x844)**:
   - Removidos os botões grandes fixos "Anterior" e "Próxima" (`.book-turn`) em telas `<= 760px`.
   - Adicionada a indicação animada de gesto `‹ Deslize para navegar ›` (`.book-swipe-indicator`) em conjunto com a pill de contagem `01 / 07`.
   - Altura dos controles reduzida de 72px para 48px, e padding inferior de `.reader-chapter` reduzido de 112px para 68px, liberando 44px de altura útil.
   - Corrigido o corte do cabeçalho do sumário mobile: cabeçalho com `safe-area-inset-top`, padding lateral unificado em 20px com os cards de capítulos e bloqueio de scroll de fundo durante exibição do drawer.
