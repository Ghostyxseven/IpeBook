# ADR 0036 — Mapbox para pontos públicos, sem localização pessoal

Data: 2026-10-09. Status: parcialmente substituído pelo [ADR 0037](0037-mapbox-sdk-nativo-no-app.md) — a decisão de usar WebView com Mapbox GL JS no Android/iOS não se sustentou (os Web Workers do Mapbox GL JS não iniciam nessa WebView) e foi trocada pelo SDK nativo (`@rnmapbox/maps`). A Web continua usando Mapbox GL JS como decidido aqui.

## Contexto

A spec 039 pede capas flutuantes no mapa e escolha do encontro. Expo 57 atende Web e Expo Go. Anúncios só guardam bairro e encontros só guardam texto.

## Decisão

Guardar `meeting_point` opcional (nome, latitude, longitude) em anúncios e cópia independente na negociação. Validar no Model e no banco; preservar RLS, filtros e bloqueios. Não derivar ponto do GPS nem do perfil. Pedir confirmação explícita de local público ao escolher.

Usar Mapbox GL JS na Web, carregado sob demanda, e o mesmo comportamento em WebView no nativo. Manter atribuição e termos do provedor. Token `pk` em `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`, nunca `sk`. Sem geocodificação ou novas assinaturas. Capas são marcadores de pontos de encontro; livros no mesmo ponto abrem uma lista.

## Alternativas

RNMapbox exige novo build e não funciona no Expo Go; mapa estático não permite explorar e escolher livremente. GPS e endereços particulares não atendem a privacidade solicitada.

## Consequências

Há consumo de mapas na conta Mapbox e dependência de rede/WebGL (Web) ou do SDK nativo (Android/iOS, ver ADR 0037). Falhas preservam lista e entrada textual. Coordenadas são indicadas pela pessoa: o sistema não atesta que o local é público. A migração (`20261009140000_mapa_pontos_encontro.sql`) foi aplicada no projeto Supabase remoto em 2026-10-10. Reverter cliente não apaga pontos; remover dados exige decisão própria.

Referências: [spec](../../specs/039-mapa-pontos-encontro/spec.md), [plano](../../specs/039-mapa-pontos-encontro/plan.md), [Expo 57 WebView](https://docs.expo.dev/versions/v57.0.0/sdk/webview/), [Mapbox](https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/).
