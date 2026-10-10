import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mountMap } from './mapRuntime';
import type { MapSurfaceProps } from './MapSurface.types';

export function MapSurface({ config, data, onEvent }: MapSurfaceProps) {
  const container = useRef<HTMLDivElement>(null);
  const runtime = useRef<ReturnType<typeof mountMap> | null>(null);
  const current = useRef({ config, data, onEvent });
  current.current = { config, data, onEvent };
  useEffect(() => {
    let active = true;
    import('mapbox-gl')
      .then(({ default: sdk }) => {
        if (!active || !container.current) return;
        try {
          runtime.current = mountMap(
            sdk,
            container.current,
            { ...current.current.config, ...current.current.data },
            (event) => current.current.onEvent(event),
          );
        } catch {
          current.current.onEvent({ type: 'error' });
        }
      })
      .catch(() => {
        if (active) current.current.onEvent({ type: 'error' });
      });
    return () => {
      active = false;
      runtime.current?.destroy();
      runtime.current = null;
    };
  }, []);
  useEffect(() => runtime.current?.update(data), [data]);
  return (
    <div
      ref={container}
      className="ipe-map-root"
      role="region"
      aria-label={
        config.selectable
          ? 'Escolher ponto público no mapa'
          : 'Livros nos pontos públicos de encontro'
      }
    />
  );
}
