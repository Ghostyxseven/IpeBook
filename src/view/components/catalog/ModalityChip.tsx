import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Modality } from '../../../model/entities/Listing';
import {
  badgeColors,
  colors,
  metrics,
  opacity,
  radius,
  spacing,
  typography,
} from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

const palette = {
  all: { background: colors.surface, text: colors.text },
  sale: badgeColors.sale,
  trade: badgeColors.trade,
  donation: badgeColors.donation,
} as const;

/**
 * Filter chip do Material 3 com as cores da modalidade (Figma 02).
 * Selecionado inverte para fundo de ação e mostra a marca de seleção, sem depender só da cor.
 */
export function ModalityChip({
  modality,
  label,
  selected,
  onPress,
  showCheck = true,
}: {
  modality: Modality | 'all';
  label: string;
  selected: boolean;
  onPress: () => void;
  showCheck?: boolean;
}) {
  const tone = palette[modality];
  const foreground = selected ? colors.surface : tone.text;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ focused }: { pressed: boolean; focused?: boolean }) => [
        styles.target,
        focused && styles.focused,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.chip,
            { backgroundColor: selected ? colors.actionDeep : tone.background },
            pressed && styles.pressed,
          ]}
        >
          {selected && showCheck && <AppIcon name="check" size={18} color={foreground} />}
          <Text style={[styles.label, { color: foreground }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Alvo de 48 px em volta do chip de 32 px, como as "Áreas de toque" do Figma.
  target: { minHeight: metrics.touchTarget, justifyContent: 'center' },
  chip: {
    minHeight: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.small,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
  },
  pressed: { opacity: opacity.high },
  label: { ...typography.bodyMedium, fontWeight: '500' },
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
