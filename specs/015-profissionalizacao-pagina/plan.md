# Plano

1. Qualidade: jsdom como dependência de desenvolvimento, lint para JS/MJS, `tsc` estrito com `noUnusedLocals`, script `verify` e workflow de CI.
2. Hospedagem: `vercel.json` sem framework incorreto, com cabeçalhos de segurança, cache imutável e fallback para `index.html`.
3. Página: viewport sem bloqueio de zoom, metadados Open Graph, `theme-color`, `robots.txt`.
4. Código: hook `useScrollLock` com contador compartilhado; remoção da armadilha de foco manual, pois `<dialog>.showModal()` já prende o foco.
5. Dados: `revisedAt` nos documentos legais; seis exemplos na estante.
6. Identidade: nome `ipebook`/`IpêBook` em `package.json` e `app.json`.
7. Documentação: ADR 0007, README, índice de ADRs.
