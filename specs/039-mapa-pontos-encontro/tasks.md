# Tarefas

- [x] Model e testes de ponto público, mapeamento e migração.
- [x] ViewModels, filtros, formulários e testes.
- [x] Mapa (Web com Mapbox GL JS; Android/iOS com SDK nativo `@rnmapbox/maps`, ADR 0037), capas, seleção e integração nas telas.
- [x] Revisão, verificações automatizadas e fluxo real; registrar limites.

## Limites registrados

- Typecheck, lint e suíte de testes passaram localmente (405 testes).
- Migração `20261009140000_mapa_pontos_encontro.sql` aplicada no projeto Supabase remoto em 2026-10-10; catálogo confirmado funcionando em aparelho Android real após a aplicação.
- A validação visual real do mapa (capas, marcador, seleção) **não foi concluída**: a primeira abordagem (WebView + Mapbox GL JS, ADR 0036) falhava de forma reproduzível em dois aparelhos Android com `bytecode is not defined` (Web Workers do Mapbox GL JS não iniciam nessa WebView). Trocado para o SDK nativo `@rnmapbox/maps` (ADR 0037), mas isso exige build de desenvolvimento nativo (EAS ou local) — não funciona no Expo Go. A validação em aparelho real com esse SDK fica pendente até o build ser gerado.
- Build nativo requer um token Mapbox secreto (`sk`, escopo `DOWNLOADS:READ`) configurado em `~/.netrc`, fora do repositório; não configurado neste ambiente.
- A validação da migração em Postgres isolado (`scripts/verificar-mapa-sql.mjs`) depende de `@electric-sql/pglite`, não instalado neste ambiente; não executada.
