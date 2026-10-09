import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, metrics, spacing } from '../../theme/nativeTheme';

/** Barra fixa das ações principais, no rodapé da tela (Figma 06.03 a 06.06). */
export function ActionBar({ children, row = false }: { children: ReactNode; row?: boolean }) {
  return <View style={[styles.bar, row && styles.row]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    gap: spacing.xs,
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.containerLow,
  },
  row: { flexDirection: 'row' },
});
