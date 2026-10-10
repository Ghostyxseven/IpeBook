# Plano — mapa de pontos públicos

Objetivo: atender os critérios da spec 039. Arquitetura MVVM simplificada: entidade MeetingPoint e validação pura; repositórios persistem JSONB opcional; hooks controlam seleção; Views renderizam mapa e formulários. Decisões: ADR 0036 (modelo de dados e Mapbox na Web) e ADR 0037 (SDK nativo do Mapbox no Android/iOS, substituindo a WebView).

1. Model: testar validação de pontos inválidos antes de implementar, adicionar mapeamento nos repositórios de anúncios e negociação, migração com constraints, view e RPCs preservando permissões. Validar com `node --test tests/meeting-points.test.mjs` e testes de repositório; executar SQL em Postgres isolado quando disponível.
2. ViewModel: integrar ponto nos formulários, rascunhos e negociação; testes de seleção, limpeza, persistência e filtros com o harness React existente.
3. View: renderizador Mapbox GL JS para Web (`MapSurface.web.tsx`) e `@rnmapbox/maps` nativo para Android/iOS (`MapSurface.tsx`, ADR 0037 — WebView abandonada por falha dos Web Workers do Mapbox GL JS), capa flutuante com sombra e fallback, agrupamento no mesmo ponto, lista acessível, seletor reutilizado em anúncios/negociação. Token público exclusivamente em ambiente local ignorado pelo Git.
4. Revisar requisitos/diff; executar tipos, lint, formatação, suíte e exportação Web. Validar mapa real em aparelho Android/iOS com build nativo (Expo Go não suporta `@rnmapbox/maps`) e no navegador, tamanhos de celular/Web, seleção, marcador, erro e teclado. Conferir aparelho disponível e registrar limites.

Dependências: mapbox-gl 3.32.0 (Web; SDK do serviço solicitado, licença comercial Mapbox; uso conforme conta) e @rnmapbox/maps 10.3.7 (Android/iOS; MIT, exige build nativo — ADR 0037). `react-native-webview` foi removido por não ser mais usado. Não adicionar geocodificação paga. Mapbox GL carrega sob demanda na Web.
