import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Modality } from '../../../model/entities/Listing';
import { colors, metrics, opacity, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

/**
 * Filtro de modalidade (Figma 02.01). No Android é o filter chip contornado do Material 3:
 * selecionado ganha fundo tonal e a marca de seleção. No iPhone é a pílula preenchida do iOS,
 * verde quando selecionada. O estado também é anunciado pelo leitor de tela, não só pela cor.
 */
export function ModalityChip({
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
  const ios = Platform.OS === 'ios';
  const foreground = ios
    ? selected
      ? colors.containerLowest
      : colors.onSurface
    : selected
      ? colors.onSelected
      : colors.onSurfaceVariant;
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
            ios ? styles.pill : styles.chip,
            ios
              ? selected
                ? styles.pillSelected
                : styles.pillIdle
              : selected
                ? styles.chipSelected
                : styles.chipIdle,
            pressed && styles.pressed,
          ]}
        >
          {selected && showCheck && !ios && <AppIcon name="check" size={18} color={foreground} />}
          <Text style={[ios ? styles.pillLabel : styles.label, { color: foreground }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Alvo de 48 px em volta do chip de 32 px, como as "Áreas de toque" do Figma.
  target: { minHeight: metrics.touchTarget, justifyContent: 'center' },
  // Android: filter chip contornado do Material 3 (32 de altura, raio pequeno).
  chip: {
    minHeight: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.small,
    borderWidth: metrics.borderThin,
  },
  chipIdle: { borderColor: colors.border },
  chipSelected: {
    paddingLeft: spacing.xs,
    borderColor: colors.selected,
    backgroundColor: colors.selected,
  },
  label: { ...typography.labelLarge },
  // iPhone: pílula preenchida (Figma iOS 83:834, 38 de altura e raio 18).
  pill: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 19,
  },
  pillIdle: { backgroundColor: colors.containerHigh },
  pillSelected: { backgroundColor: colors.action },
  pillLabel: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  pressed: { opacity: opacity.high },
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
