import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

/** Barra superior pequena do M3: seta de voltar e título (Figma 07.10, 09.03 e 09.04). */
export function TopAppBar({
  title,
  onBack,
  backLabel = 'Voltar',
}: {
  title: string;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
          styles.icon,
          pressed && styles.pressed,
          focused && styles.focused,
        ]}
      >
        <AppIcon name="back" color={colors.onSurface} />
      </Pressable>
      <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  icon: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: metrics.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.pressed },
  title: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
    flex: 1,
  },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
});
