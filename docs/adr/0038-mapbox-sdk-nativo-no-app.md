# ADR 0038 — SDK nativo do Mapbox no Android/iOS; Web continua com Mapbox GL JS

Data: 2026-10-10. Status: aceito e validado — build de desenvolvimento gerado via EAS (perfil `preview`, APK) e confirmado funcionando em aparelho Android real.

## Contexto

O ADR 0036 decidiu renderizar o mapa (capas flutuantes, ADR/spec 039) com Mapbox GL JS dentro de uma `WebView` tanto na Web quanto no Android/iOS, por não exigir build nativo e funcionar no Expo Go. Na prática, testando em dois aparelhos Android reais, o Mapbox GL JS 3.32.0 falhava consistentemente dentro da `WebView` com o erro `bytecode is not defined` — uma falha de inicialização dos Web Workers que a biblioteca usa para decodificar tiles, reproduzida com `source={{ html }}` inline e também com o HTML servido por uma URI real (asset do Metro), eliminando a hipótese de origem opaca/bloqueio de navegação. O mesmo Mapbox GL JS funciona perfeitamente no Chrome do mesmo aparelho, confirmando que o problema é específico da `WebView` embutida, não do dispositivo, rede ou token.

Quem pediu a correção aceitou abandonar o Expo Go para o fluxo nativo: passar a gerar um build de desenvolvimento (EAS/dev client) para testar o mapa no Android/iOS, o que remove a restrição original que levou o ADR 0036 a descartar o SDK nativo do Mapbox.

## Decisão

Usar `@rnmapbox/maps` (SDK nativo) para renderizar o mapa no Android e no iOS, substituindo a `WebView`. A Web continua com Mapbox GL JS, carregado sob demanda via `import('mapbox-gl')`, como já decidido no ADR 0036 — `MapSurface.web.tsx` não muda.

`MapSurface.tsx` (variante nativa, resolvida pelo Metro para Android/iOS) passa a renderizar `MapView`/`Camera`/`MarkerView` do `@rnmapbox/maps` em vez de injetar HTML numa `WebView`. A interface pública (`MapSurfaceProps`: `config`, `data`, `onEvent`) não muda, então `PublicMap.tsx` e o restante do app continuam iguais. `mapRuntime.ts` (a função `mountMap`, usada para montar o Mapbox GL JS via DOM) continua existindo só para a Web.

Capas (marcadores de livro) usam `MarkerView` com um `Pressable` filho — RN nativo, sem HTML/CSS — reaproveitando os tokens de design já usados na versão Web (`coverColors`, `radius`, `spacing`, `metrics.touchTarget`, etc.), não duplicando novos valores.

Requer o plugin `@rnmapbox/maps` no `app.json` e, para compilar no Android, um token Mapbox **secreto** (`sk.`) com escopo `DOWNLOADS:READ`, configurado localmente em `~/.netrc` (`machine api.mapbox.com`, `login mapbox`, `password <token sk>`) — nunca no repositório. Sem esse token, `expo prebuild`/`eas build` falha ao baixar o SDK nativo do Mapbox; isso é read-only no Maven da Mapbox, não embarca no app nem é usado em runtime (o token público `pk` em `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` continua sendo o único usado pelo app em execução).

## Alternativas

Manter Mapbox GL JS em WebView no nativo (ADR 0036): descartado porque reproduz o erro de Worker de forma consistente, não é um problema de configuração corrigível sem mudar de abordagem. Trocar a versão do Mapbox GL JS carregada via CDN (ex.: v2.x) foi cogitado como teste rápido, mas não foi validado antes de decidir pelo SDK nativo — fica registrado como algo já descartado, não como pendência. Mapa estático sem interação não atende aos critérios de aceite da spec 039 (explorar, tocar, escolher ponto).

## Consequências

O app deixa de rodar a tela do mapa no Expo Go puro no Android/iOS: a partir de agora, testar o mapa nativo exige build de desenvolvimento (EAS ou local). As demais telas continuam funcionando no Expo Go normalmente, pois `@rnmapbox/maps` só é importado pela árvore de telas do mapa. A Web não muda e continua funcionando como estava.

Build local requer configurar o `~/.netrc` com o token secreto de download do Mapbox antes de `expo prebuild`/`eas build`; builds na nuvem (EAS) precisam do mesmo token também como variável de ambiente do projeto (`EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`, que já existia, mais o segredo de download, configurado separadamente). `@rnmapbox/maps` declara `mapbox-gl@^2.9.0` como peer opcional; como o projeto usa `mapbox-gl` 3.x na Web, `npm ci` no EAS Build falhava com `ERESOLVE` — corrigido com um `.npmrc` (`legacy-peer-deps=true`) no repositório.

Validado: build `preview` (APK) gerada via EAS e instalada em aparelho Android real, com o mapa funcionando.

Referências: [spec](../../specs/039-mapa-pontos-encontro/spec.md), [plano](../../specs/039-mapa-pontos-encontro/plan.md), [ADR 0036](0036-mapa-de-pontos-publicos.md), [Mapbox Maps SDK — Android](https://docs.mapbox.com/android/maps/guides/), [Mapbox Maps SDK — iOS](https://docs.mapbox.com/ios/maps/guides/), [@rnmapbox/maps](https://github.com/rnmapbox/maps).
