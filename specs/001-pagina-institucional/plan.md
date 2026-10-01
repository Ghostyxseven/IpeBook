# Plano

Expo 57 e React 19 existentes; sem roteador ou biblioteca de interface adicional. Entrada `App.web.tsx` com HTML semântico e CSS. Conteúdo e resolução de destinos no Model; hook para estado; componentes para apresentação. Ver ADR 0004.

## Direção visual

Tokens existentes: fundo #F6F1E8, superfície #FCFAF6, texto #3C302A, verde #426B55, verde profundo #2F503D e destaque #F4B942. Roboto local, título amplo e leitura confortável. Cabeçalho persistente, hero com composição original de livros, modalidades, passos, FAQ e rodapé legal. Coluna única no celular.

A inspeção da página Web 33:95 não identificou landing institucional. O quadro 53:185 foi consultado como referência de marca/mensagem, não como tela a reproduzir. Composição nova atende ao pedido corrigido; Roboto preserva o contrato visual apesar de Inter no quadro atual.

## Sequência e verificação

1. Especificar e registrar decisão; implementar e testar domínio sem React.
2. Implementar hook; verificar transições, menu e diálogo em React DOM isolado.
3. Implementar View Web e recursos locais.
4. Executar TypeScript, formatação, exportação e Playwright MCP em desktop/celular. Verificar âncoras, documentos, histórico, menu, diálogo, FAQ, console, cookies e armazenamento; axe-core quando disponível.
5. Revisar diff e registrar evidências. Sem publicação ou commit.

## Organização da View

Conforme correção explícita do usuário, `App.web.tsx` e `src/app/index.web.tsx` apenas exportam a tela. A interface está em `src/view/screens/InstitutionalScreen.web.tsx`; não concentrar JSX em `app`.
