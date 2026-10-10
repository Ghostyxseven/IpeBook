import type mapboxgl from 'mapbox-gl';
import type { Coordinates } from '../../../model/entities/MeetingPoint';

export type MapMarker = Coordinates & {
  id: string;
  title: string;
  label: string;
  coverUrl: string | null;
  count: number;
};
export type MapData = { markers: MapMarker[]; point: Coordinates | null };
export type MapEvent =
  | { type: 'ready' | 'error' }
  | { type: 'select'; id: string }
  | { type: 'point'; latitude: number; longitude: number };
export type MapConfig = MapData & {
  token: string;
  selectable: boolean;
  css: string;
  color: string;
  padding: { top: number; bottom: number; left: number; right: number };
};

/** Sem dependências externas ao argumento: serializado também na WebView do Expo Go. */
export function mountMap(
  sdk: typeof mapboxgl,
  container: HTMLElement,
  config: MapConfig,
  emit: (event: MapEvent) => void,
) {
  const style = document.createElement('style');
  style.textContent = config.css;
  document.head.appendChild(style);
  const map = new sdk.Map({
    container,
    accessToken: config.token,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: config.point ? [config.point.longitude, config.point.latitude] : [-41.776, -4.273],
    zoom: 13,
    attributionControl: true,
    cooperativeGestures: !config.selectable,
    locale: {
      'ScrollZoomBlocker.CtrlMessage': 'Use Ctrl + rolagem para aproximar o mapa',
      'ScrollZoomBlocker.CmdMessage': 'Use ⌘ + rolagem para aproximar o mapa',
      'TouchPanBlocker.Message': 'Use dois dedos para mover o mapa',
      'NavigationControl.ZoomIn': 'Aproximar',
      'NavigationControl.ZoomOut': 'Afastar',
      'NavigationControl.ResetBearing': 'Orientar para o norte',
      'AttributionControl.ToggleAttribution': 'Créditos do mapa',
    },
  });
  map.addControl(new sdk.NavigationControl({ showCompass: false }), 'top-right');
  let markers: mapboxgl.Marker[] = [];
  let pin: mapboxgl.Marker | null = null;
  let lastIds = '';
  let loaded = false;
  let data: MapData = config;
  function update(next: MapData) {
    data = next;
    if (!loaded) return;
    const ids = JSON.stringify(next.markers);
    if (ids !== lastIds) {
      markers.forEach((marker) => marker.remove());
      markers = [];
      const bounds = new sdk.LngLatBounds();
      for (const item of next.markers) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ipe-map-book';
        button.setAttribute('aria-label', item.label);
        button.title = item.label;
        const book = document.createElement('span');
        book.className = 'ipe-map-cover';
        const title = document.createElement('span');
        title.textContent = item.title;
        book.appendChild(title);
        if (item.coverUrl && /^https:\/\//i.test(item.coverUrl)) {
          const image = document.createElement('img');
          image.alt = '';
          image.src = item.coverUrl;
          image.referrerPolicy = 'no-referrer';
          image.addEventListener('error', () => image.remove());
          book.appendChild(image);
        }
        button.appendChild(book);
        if (item.count > 1) {
          const count = document.createElement('span');
          count.className = 'ipe-map-count';
          count.textContent = String(item.count);
          button.appendChild(count);
        }
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          emit({ type: 'select', id: item.id });
        });
        markers.push(
          new sdk.Marker({ element: button, anchor: 'bottom' })
            .setLngLat([item.longitude, item.latitude])
            .addTo(map),
        );
        bounds.extend([item.longitude, item.latitude]);
      }
      if (next.markers.length)
        map.fitBounds(bounds, { padding: config.padding, maxZoom: 15, duration: 0 });
      lastIds = ids;
    }
    pin?.remove();
    pin = null;
    if (next.point)
      pin = new sdk.Marker({ color: config.color })
        .setLngLat([next.point.longitude, next.point.latitude])
        .addTo(map);
  }
  map.on('load', () => {
    loaded = true;
    update(data);
    emit({ type: 'ready' });
  });
  map.on('error', () => emit({ type: 'error' }));
  if (config.selectable)
    map.on('click', (event) =>
      emit({ type: 'point', latitude: event.lngLat.lat, longitude: event.lngLat.wrap().lng }),
    );
  return {
    update,
    destroy: () => {
      map.remove();
      style.remove();
    },
  };
}
