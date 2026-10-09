import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon, type AppIconName } from '../AppIcon';

/** Retorno de uma etapa da negociação (Figma 06.05, 06.08, 06.12 e 06.18). */
export function OutcomeHero({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  /** Ícone no círculo; sem ícone, só o título e o texto (Figma 06.12 e 06.18). */
  icon?: AppIconName;
}) {
  return (
    <View style={[styles.hero, icon && styles.centered]}>
      {icon && (
        <View style={styles.badge}>
          <AppIcon name={icon} size={32} color={colors.onSelected} />
        </View>
      )}
      <Text
        style={[styles.title, icon && styles.textCentered]}
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
      >
        {title}
      </Text>
      <Text style={[styles.body, icon && styles.textCentered]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.xs },
  centered: { alignItems: 'center' },
  badge: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { ...typography.brandHeadline, fontSize: 28, lineHeight: 34, color: colors.onSurface },
  body: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  textCentered: { textAlign: 'center' },
});
