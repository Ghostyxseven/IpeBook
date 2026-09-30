import { Platform, type TextStyle } from 'react-native';
import tokens from '../../../design-tokens.json';

type Token<T> = { $value: T };

/** Converte o token "16px" em 16. Os tokens guardam medidas como texto em px. */
const px = (token: Token<string>) => Number.parseFloat(token.$value);

const platform = Platform.select({
  android: tokens.platform.android,
  ios: tokens.platform.ios,
  default: tokens.platform.web,
});

const typeStyle = (style: {
  weight: Token<number>;
  fontSize: Token<string>;
  lineHeight: Token<string>;
}): TextStyle => ({
  // Android já usa Roboto no sistema; iOS mantém a fonte nativa (design-system.md).
  fontFamily: Platform.OS === 'web' ? tokens.typography.fontFamily.$value : undefined,
  fontWeight: String(style.weight.$value) as TextStyle['fontWeight'],
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
  xxs: px(tokens.spacing['4']),
  xs: px(tokens.spacing['8']),
  sm: px(tokens.spacing['12']),
  md: px(tokens.spacing['16']),
  lg: px(tokens.spacing['24']),
  xl: px(tokens.spacing['32']),
  xxl: px(tokens.spacing['48']),
} as const;

export const metrics = {
  controlHeight: px(platform.controlHeight),
  fieldRadius: px(platform.fieldRadius),
  cardRadius: px(platform.cardRadius),
  navigationRadius: px(platform.navigationRadius),
  pagePadding: px(platform.pagePadding),
  touchTarget: px(tokens.accessibility.touchTarget),
  focusWidth: px(tokens.accessibility.focusWidth),
  focusOffset: px(tokens.accessibility.focusOffset),
  borderThin: px(tokens.border.thin),
  borderStrong: px(tokens.border.strong),
  /** Largura máxima de formulários em tablets. */
  formMaxWidth: px(tokens.app.formMaxWidth),
} as const;

export const typography = {
  caption: typeStyle(tokens.typography.caption),
  body: typeStyle(tokens.typography.body),
  action: typeStyle(tokens.typography.action),
  section: typeStyle(tokens.typography.section),
  title: typeStyle(tokens.typography.title),
} as const;
