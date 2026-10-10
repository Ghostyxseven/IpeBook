import {
  colors,
  metrics,
  radius,
  spacing,
  typography,
  coverColors,
  opacity,
} from '../../theme/nativeTheme';

/** Capas usam a escala existente; sombra de chão dá profundidade sem movimento contínuo. */
export const mapCss = `
html, body { margin: 0; height: 100%; }
.ipe-map-root { width:100%; height:100%; min-height:${spacing.xxl * 6}px; }
.ipe-map-book { border:0; background:transparent; cursor:pointer; padding:${spacing.xs}px;
  min-width:${metrics.touchTarget}px; min-height:${metrics.touchTarget}px; color:${coverColors.text}; }
.ipe-map-book::after { content:''; display:block; margin:${spacing.xs}px auto 0;
  width:${spacing.xl}px; height:${spacing.xxs}px; border-radius:${radius.full}px;
  background:${colors.onSurface}; opacity:${opacity.medium}; filter:blur(${spacing.xxs}px); }
.ipe-map-cover { position:relative; display:flex; align-items:center; justify-content:center;
  width:${metrics.touchTarget}px; height:${metrics.touchTarget + spacing.lg}px;
  border-radius:${radius.small}px; background:${coverColors.backgrounds[2]};
  border-left:${metrics.borderStrong}px solid ${colors.actionDeep}; overflow:hidden;
  box-shadow:${spacing.xxs}px ${spacing.xxs}px ${spacing.xs}px ${colors.border}; }
.ipe-map-cover span { font: ${typography.bodyMedium.fontSize}px/${typography.bodyMedium.lineHeight}px sans-serif;
  padding:${spacing.xxs}px; overflow:hidden; max-height:100%; overflow-wrap:anywhere; }
.ipe-map-cover img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.ipe-map-count { position:absolute; right:0; top:0; border-radius:${radius.full}px;
  background:${colors.action}; color:${colors.surface}; padding:${spacing.xxs}px ${spacing.xs}px; font:bold ${typography.bodyMedium.fontSize}px sans-serif; }
.ipe-map-book:focus-visible { outline:${metrics.focusWidth}px solid ${colors.focus}; outline-offset:${metrics.focusOffset}px; }
.ipe-map-book:hover .ipe-map-cover, .ipe-map-book:focus-visible .ipe-map-cover { border-color:${colors.highlight}; }
.mapboxgl-ctrl-group button { min-width:${metrics.touchTarget}px; min-height:${metrics.touchTarget}px; }
.mapboxgl-ctrl button:focus-visible, .mapboxgl-ctrl-attrib a:focus-visible { outline:${metrics.focusWidth}px solid ${colors.focus}; }
`;
