import { SymbolView } from 'expo-symbols';
import { colors } from '../theme/nativeTheme';

/** Nomes por plataforma (ADR 0009): SF Symbols no iOS, Material Symbols no Android e na Web. */
const symbols = {
  home: { ios: 'house', android: 'home', web: 'home' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  logout: {
    ios: 'rectangle.portrait.and.arrow.right',
    android: 'logout',
    web: 'logout',
  },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  error: { ios: 'exclamationmark.circle', android: 'error', web: 'error' },
} as const;

export type AppIconName = keyof typeof symbols;

/** Ícone decorativo: o rótulo acessível fica no controle que o contém. */
export function AppIcon({
  name,
  size = 24,
  color = colors.text,
}: {
  name: AppIconName;
  size?: number;
  color?: string;
}) {
  return (
    <SymbolView
      name={symbols[name]}
      size={size}
      tintColor={color}
      style={{ width: size, height: size }}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}
