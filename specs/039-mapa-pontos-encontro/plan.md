# Plano — mapa de pontos públicos

Objetivo: atender os critérios da spec 039. Arquitetura MVVM simplificada: entidade MeetingPoint e validação pura; repositórios persistem JSONB opcional; hooks controlam seleção; Views renderizam mapa e formulários. Decisão: ADR 0036.

1. Model: testar validação de pontos inválidos antes de implementar, adicionar mapeamento nos repositórios de anúncios e negociação, migração com constraints, view e RPCs preservando permissões. Validar com `node --test tests/meeting-points.test.mjs` e testes de repositório; executar SQL em Postgres isolado quando disponível.
2. ViewModel: integrar ponto nos formulários, rascunhos e negociação; testes de seleção, limpeza, persistência e filtros com o harness React existente.
3. View: renderizador Mapbox GL JS para Web e WebView no Expo Go, capa flutuante com sombra e fallback, agrupamento no mesmo ponto, lista acessível, seletor reutilizado em anúncios/negociação. Token público exclusivamente em ambiente local ignorado pelo Git.
4. Revisar requisitos/diff; executar tipos, lint, formatação, suíte e exportação Web. Validar mapa real no navegador via CDP (sem Playwright), tamanhos de celular/Web, seleção, marcador, erro e teclado. Conferir aparelho disponível e registrar limites.

Dependências: mapbox-gl 3.32.0 (SDK do serviço solicitado, licença comercial Mapbox; uso conforme conta) e react-native-webview 13.16.1 (MIT, versão recomendada pelo Expo 57, incluída no Expo Go). Alternativa RNMapbox exige build nativo e não atende Expo Go. Não adicionar geocodificação paga. Mapbox GL carrega sob demanda.
