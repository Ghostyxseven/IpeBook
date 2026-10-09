import { StyleSheet, Text, View } from 'react-native';
import type { Modality } from '../../../model/entities/Listing';
import { modalityLabels, statusLabels } from '../../../model/services/catalogFormat.ts';
import { badgeColors, radius, spacing, typography } from '../../theme/nativeTheme';

export type BadgeVariant = Modality | 'reserved' | 'completed';

const palette = {
  sale: badgeColors.sale,
  trade: badgeColors.trade,
  donation: badgeColors.donation,
  reserved: badgeColors.reserved,
  // Concluído (Figma iOS 05.04, "Estante · Concluídos"): mesmo selo, variante escura.
  completed: badgeColors.completed,
} as const;

const statusVariants = { reserved: 'reservado', completed: 'concluido' } as const;

/** IpêBook / Status Badge: o texto sempre aparece; a cor só reforça. */
export function StatusBadge({ variant }: { variant: BadgeVariant }) {
  const statusKey = statusVariants[variant as keyof typeof statusVariants];
  const label = statusKey ? statusLabels[statusKey] : modalityLabels[variant as Modality];
  const colors = palette[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.small,
  },
  label: { ...typography.labelMedium },
});
