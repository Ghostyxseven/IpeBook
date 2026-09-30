import { Platform, type TextStyle } from 'react-native';
import tokens from '../../../design-tokens.json';

/** Converte "16px" em 16. Os tokens guardam medidas como texto em px. */
const px = (value: string) => Number.parseFloat(value);

const platform = Platform.select({
  android: tokens.platform.android,
  ios: tokens.platform.ios,
  default: tokens.platform.web,
});

const typeStyle = (style: { weight: number; fontSize: string; lineHeight: string }): TextStyle => ({
  // Android já usa Roboto no sistema; iOS mantém a fonte nativa (design-system.md).
  fontFamily: Platform.OS === 'web' ? tokens.typography.fontFamily : undefined,
  fontWeight: String(style.weight) as TextStyle['fontWeight'],
  fontSize: px(style.fontSize),
  lineHeight: px(style.lineHeight),
});

export const colors = {
  background: tokens.color.background.$value,
  surface: tokens.color.surface.$value,
  text: tokens.color.text.$value,
  secondaryText: tokens.color.secondaryText.$value,
  action: tokens.color.action.$value,
  actionDeep: tokens.color.actionDeep.$value,
  soft: tokens.color.soft.$value,
  border: tokens.color.border.$value,
  brown: tokens.color.brown.$value,
  success: tokens.color.success.$value,
  error: tokens.color.error.$value,
  highlight: tokens.color.highlight.$value,
  focus: tokens.color.state.focus.$value,
  disabledBackground: tokens.color.state.disabledBackground.$value,
  disabledText: tokens.color.state.disabledText.$value,
  pressed: tokens.color.state.pressed.$value,
} as const;

export const spacing = {
  xxs: px(tokens.spacing['4'].$value),
  xs: px(tokens.spacing['8'].$value),
  sm: px(tokens.spacing['12'].$value),
  md: px(tokens.spacing['16'].$value),
  lg: px(tokens.spacing['24'].$value),
  xl: px(tokens.spacing['32'].$value),
  xxl: px(tokens.spacing['48'].$value),
} as const;

export const metrics = {
  controlHeight: px(platform.controlHeight),
  fieldRadius: px(platform.fieldRadius),
  cardRadius: px(platform.cardRadius),
  navigationRadius: px(platform.navigationRadius),
  pagePadding: px(platform.pagePadding),
  /** Alvo mínimo de toque exigido pelo AGENTS.md. */
  touchTarget: 48,
  /** Largura máxima de formulários na Web e em tablets. */
  formMaxWidth: px(tokens.app.formMaxWidth.$value),
} as const;

export const typography = {
  caption: typeStyle(tokens.typography.caption),
  body: typeStyle(tokens.typography.body),
  action: typeStyle(tokens.typography.action),
  section: typeStyle(tokens.typography.section),
  title: typeStyle(tokens.typography.title),
} as const;
