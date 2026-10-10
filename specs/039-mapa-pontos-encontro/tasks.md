# Tarefas

- [x] Model e testes de ponto público, mapeamento e migração.
- [x] ViewModels, filtros, formulários e testes.
- [x] Mapa (Web com Mapbox GL JS; Android/iOS com SDK nativo `@rnmapbox/maps`, ADR 0038), capas, seleção e integração nas telas.
- [x] Revisão, verificações automatizadas e fluxo real; registrar limites.

## Limites registrados

- Typecheck, lint e suíte de testes passaram localmente (405 testes).
- Migração `20261009140000_mapa_pontos_encontro.sql` aplicada no projeto Supabase remoto em 2026-10-10; catálogo confirmado funcionando em aparelho Android real após a aplicação.
- Validação visual real do mapa **concluída**: build de desenvolvimento gerado via EAS (perfil `preview`, APK) e instalado em aparelho Android real; usuário confirmou o mapa funcionando com o SDK nativo `@rnmapbox/maps`. A primeira abordagem (WebView + Mapbox GL JS, ADR 0036) havia falhado de forma reproduzível em dois aparelhos Android com `bytecode is not defined` (Web Workers do Mapbox GL JS não iniciam nessa WebView) — motivou a troca registrada no ADR 0038.
- Build nativo requer um token Mapbox secreto (`sk`, escopo `DOWNLOADS:READ`) configurado em `~/.netrc` (local) e como variável de ambiente `preview` no EAS; ambos configurados e usados com sucesso na build `4d107865-2dbc-4db8-8c98-9a959add30fb`.
- A validação da migração em Postgres isolado (`scripts/verificar-mapa-sql.mjs`) depende de `@electric-sql/pglite`, não instalado neste ambiente; não executada.
- O EAS Build (`npm ci`) exigiu um `.npmrc` com `legacy-peer-deps=true`: `@rnmapbox/maps` declara `mapbox-gl@^2.9.0` como peer opcional, conflitando com o `mapbox-gl` 3.x usado só na Web; o peer é opcional e o conflito não afeta o funcionamento real.
