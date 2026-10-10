import { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { mountMap } from './mapRuntime';
import type { MapEvent } from './mapRuntime';
import type { MapSurfaceProps } from './MapSurface.types';

const encode = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
/** O token público e pontos públicos são os únicos dados enviados ao documento isolado. */
export function MapSurface({ config, data, onEvent }: MapSurfaceProps) {
  const web = useRef<WebView>(null);
  const latest = useRef(data);
  latest.current = data;
  const [html] = useState(
    () => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v3.32.0/mapbox-gl.css"><style>html,body,#map{height:100%;margin:0}</style></head><body><div id="map" class="ipe-map-root"></div><script src="https://api.mapbox.com/mapbox-gl-js/v3.32.0/mapbox-gl.js"></script><script>
  try { window.ipeMap = (${mountMap.toString()})(mapboxgl, document.getElementById('map'), ${encode(config)}, function(event){window.ReactNativeWebView.postMessage(JSON.stringify(event));}); } catch(e) {window.ReactNativeWebView.postMessage('{"type":"error"}');}
  </script></body></html>`,
  );
  const update = () =>
    web.current?.injectJavaScript(
      `window.ipeMap && window.ipeMap.update(${encode(latest.current)});true;`,
    );
  useEffect(update, [data]);
  return (
    <WebView
      ref={web}
      source={{ html }}
      originWhitelist={['*']}
      javaScriptEnabled
      geolocationEnabled={false}
      allowsInlineMediaPlayback={false}
      mixedContentMode="never"
      onMessage={(event) => {
        try {
          const message = JSON.parse(event.nativeEvent.data) as MapEvent;
          if (message.type === 'ready') update();
          onEvent(message);
        } catch {
          onEvent({ type: 'error' });
        }
      }}
      onShouldStartLoadWithRequest={(request) => {
        if (request.url === 'about:blank') return true;
        if (/^https:\/\/(www\.)?(mapbox\.com|openstreetmap\.org)\//.test(request.url))
          void Linking.openURL(request.url).catch(() => {});
        return false;
      }}
      onError={() => onEvent({ type: 'error' })}
    />
  );
}
