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
  /** Papéis do Material 3 usados pelas telas redesenhadas a partir do Figma oficial. */
  onSurface: tokens.color.onSurface.$value,
  onSurfaceVariant: tokens.color.onSurfaceVariant.$value,
  outlineVariant: tokens.color.outlineVariant.$value,
  containerLowest: tokens.color.container.lowest.$value,
  containerLow: tokens.color.container.low.$value,
  container: tokens.color.container.default.$value,
  containerHigh: tokens.color.container.high.$value,
  selected: tokens.color.selected.background.$value,
  onSelected: tokens.color.selected.text.$value,
  /** Marca nas telas de acesso (Figma, seção 01): logotipo, traço e destaque do título. */
  brandBrown: tokens.color.brandBrown.$value,
  brandAmber: tokens.color.brandAmber.$value,
  tertiaryContainer: tokens.color.tertiaryContainer.$value,
  /** Estados do sistema (Figma, seção 10): fundo do ícone de erro e aviso escuro. */
  errorContainer: tokens.color.errorContainer.$value,
  inverseSurface: tokens.color.inverseSurface.$value,
  inverseOnSurface: tokens.color.inverseOnSurface.$value,
  /** Visor da leitura de ISBN (Figma 04.02): fundo escuro atrás da imagem da câmera. */
  scannerSurface: tokens.color.scanner.surface.$value,
  scannerOnSurface: tokens.color.scanner.onSurface.$value,
  scannerVeil: tokens.color.scanner.veil.$value,
  /** iOS (Figma 07 · iPhone): célula agrupada, rótulo secundário e separador. */
  iosCell: tokens.color.ios.cell.$value,
  iosSecondaryLabel: tokens.color.ios.secondaryLabel.$value,
  iosSeparator: tokens.color.ios.separator.$value,
  /** Liquid Glass (referência `ios.md`): só na camada de navegação que flutua. */
  glassFill: tokens.color.ios.glassFill.$value,
  glassStroke: tokens.color.ios.glassStroke.$value,
  /** Sobre imagem ou câmera, com ícones brancos. */
  glassFillDark: tokens.color.ios.glassFillDark.$value,
} as const;

const badge = (name: keyof typeof tokens.color.badge) => ({
  background: tokens.color.badge[name].background.$value,
  text: tokens.color.badge[name].text.$value,
});

/** Cores do Status Badge; o texto do badge é obrigatório e a cor só reforça. */
export const badgeColors = {
  sale: badge('sale'),
  trade: badge('trade'),
  donation: badge('donation'),
  reserved: badge('reserved'),
  completed: badge('completed'),
  /** Chip de Troca: amarelo-claro, mais suave que o selo (Figma 02). */
  tradeChip: tokens.color.badge.trade.chip.$value,
} as const;

export const radius = {
  small: px(tokens.radius.small),
  medium: px(tokens.radius.medium),
  extraLarge: px(tokens.radius.extraLarge),
  full: px(tokens.radius.full),
} as const;

/** Fundos das capas ilustrativas (anúncio sem foto), na ordem usada para escolher a cor. */
export const coverColors = {
  backgrounds: [
    tokens.color.cover.blue.$value,
    tokens.color.cover.brown.$value,
    tokens.color.cover.green.$value,
  ],
  text: tokens.color.cover.text.$value,
} as const;

export const opacity = {
  high: tokens.opacity.high.$value,
  medium: tokens.opacity.medium.$value,
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
  /** Fio de 0,5 pt da borda do Liquid Glass. */
  borderHairline: px(tokens.border.hairline),
  /** Largura máxima de formulários em tablets. */
  formMaxWidth: px(tokens.app.formMaxWidth),
  /** Listas e painéis ocupam a página Web; o layout nativo mantém a medida atual. */
  contentMaxWidth:
    Platform.OS === 'web' ? px(tokens.app.web.contentMaxWidth) : px(tokens.app.formMaxWidth),
  /** Textos longos mantêm uma linha legível no navegador. */
  readingMaxWidth:
    Platform.OS === 'web' ? px(tokens.app.web.readingMaxWidth) : px(tokens.app.formMaxWidth),
} as const;

/** Medidas da composição Web; correspondem à referência de breakpoints publicada. */
export const webLayout = {
  medium: px(tokens.app.web.mediumBreakpoint),
  expanded: px(tokens.app.web.expandedBreakpoint),
  large: px(tokens.app.web.largeBreakpoint),
  contentMaxWidth: px(tokens.app.web.contentMaxWidth),
  railWidth: px(tokens.app.web.railWidth),
  headerHeight: px(tokens.app.web.headerHeight),
  searchMaxWidth: px(tokens.app.web.searchMaxWidth),
  filterWidth: px(tokens.app.web.filterWidth),
  detailsPaneWidth: px(tokens.app.web.detailsPaneWidth),
  conversationListWidth: px(tokens.app.web.conversationListWidth),
} as const;

/**
 * Receita do Liquid Glass (referência `ios.md`): desfoque de 22 pt e saturação de 180%.
 * Só existe no iPhone; as outras plataformas usam superfície sólida.
 */
export const glass = {
  blur: tokens.platform.ios.glassBlur.$value,
  saturation: tokens.platform.ios.glassSaturation.$value,
} as const;

/** Nome com que a fonte da marca é registrada no `useFonts` do layout raiz. */
export const BRAND_FONT = 'SourceSerif4-Bold';

export const typography = {
  caption: typeStyle(tokens.typography.caption),
  body: typeStyle(tokens.typography.body),
  action: typeStyle(tokens.typography.action),
  section: typeStyle(tokens.typography.section),
  title: typeStyle(tokens.typography.title),
  /** Escala Material 3 do Figma (`typography.scale`). */
  displayLarge: typeStyle(tokens.typography.scale.displayLarge),
  titleLarge: typeStyle(tokens.typography.scale.titleLarge),
  titleMedium: typeStyle(tokens.typography.scale.titleMedium),
  bodyLarge: typeStyle(tokens.typography.scale.bodyLarge),
  bodyMedium: typeStyle(tokens.typography.scale.bodyMedium),
  labelMedium: typeStyle(tokens.typography.scale.labelMedium),
  /** Rótulo de botão do Material 3 (Figma `Android/m3-label-lg`). */
  labelLarge: typeStyle(tokens.typography.scale.labelLarge),
  /** Estilos do iOS no Figma (`iOS/ios-body`, `ios-subheadline`, `ios-footnote`), na fonte do sistema. */
  iosBody: typeStyle(tokens.typography.ios.body),
  iosSubheadline: typeStyle(tokens.typography.ios.subheadline),
  iosFootnote: typeStyle(tokens.typography.ios.footnote),
  /**
   * Título de marca em Source Serif 4 (no máximo um por tela). O arquivo da fonte já é o
   * negrito, então o peso não é repetido: no Android, peso junto de fonte própria troca a fonte.
   */
  brandHeadline: {
    fontFamily: BRAND_FONT,
    fontSize: px(tokens.typography.brand.headline.fontSize),
    lineHeight: px(tokens.typography.brand.headline.lineHeight),
  } satisfies TextStyle,
  /** Título da tela de boas-vindas (Figma `Marca/brand-large-title`, 34/41). */
  brandLargeTitle: {
    fontFamily: BRAND_FONT,
    fontSize: px(tokens.typography.brand.largeTitle.fontSize),
    lineHeight: px(tokens.typography.brand.largeTitle.lineHeight),
  } satisfies TextStyle,
  /** Título grande das telas de acesso (Figma `Marca/brand-display-md`, 36/41). */
  brandDisplay: {
    fontFamily: BRAND_FONT,
    fontSize: px(tokens.typography.brand.display.fontSize),
    lineHeight: px(tokens.typography.brand.display.lineHeight),
  } satisfies TextStyle,
  /** Logotipo tipográfico (Figma `brand-wordmark`, 28/31). */
  brandWordmark: {
    fontFamily: BRAND_FONT,
    fontSize: px(tokens.typography.brand.wordmark.fontSize),
    lineHeight: px(tokens.typography.brand.wordmark.lineHeight),
  } satisfies TextStyle,
  /** Título de marca menor (Figma `Marca/brand-title`), usado nos estados vazios. */
  brandTitle: {
    fontFamily: BRAND_FONT,
    fontSize: px(tokens.typography.brand.title.fontSize),
    lineHeight: px(tokens.typography.brand.title.lineHeight),
  } satisfies TextStyle,
} as const;
