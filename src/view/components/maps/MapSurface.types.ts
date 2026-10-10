import type { MapConfig, MapData, MapEvent } from './mapRuntime';
export type MapSurfaceProps = {
  config: MapConfig;
  data: MapData;
  onEvent: (event: MapEvent) => void;
};
