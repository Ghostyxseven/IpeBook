import { StyleSheet, Text, View } from 'react-native';
import type { Modality } from '../../../model/entities/Listing';
import { modalityLabels, statusLabels } from '../../../model/services/catalogFormat.ts';
import { badgeColors, radius, spacing, typography } from '../../theme/nativeTheme';

export type BadgeVariant = Modality | 'reserved';

const palette = {
  sale: badgeColors.sale,
  trade: badgeColors.trade,
  donation: badgeColors.donation,
  reserved: badgeColors.reserved,
} as const;

/** IpêBook / Status Badge: o texto sempre aparece; a cor só reforça. */
export function StatusBadge({ variant }: { variant: BadgeVariant }) {
  const label = variant === 'reserved' ? statusLabels.reservado : modalityLabels[variant];
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
    borderRadius: radius.full,
  },
  label: { ...typography.caption, fontWeight: '600' },
});
