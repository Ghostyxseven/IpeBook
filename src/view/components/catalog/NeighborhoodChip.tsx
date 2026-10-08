import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useMyNeighborhood } from '../../../factories/profile';
import { AppIcon } from '../AppIcon';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/**
 * Bairro de quem está logado, no topo do Início e do Explorar (Figma 02.01 e 02.02):
 * "Centro ⌄". Não é seletor de cidade — o app atende só Piripiri (ADR 0020) — é o
 * bairro do perfil, já coletado no onboarding (Figma 01.17). O toque abre a mesma
 * tela de editar bairro; sem bairro salvo, o chip convida a escolher um.
 */
export function NeighborhoodChip() {
  const router = useRouter();
  const { neighborhood, status } = useMyNeighborhood();
  const label = status === 'ready' && neighborhood ? neighborhood : 'Escolher bairro';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Bairro: ${label}. Toque para mudar`}
      onPress={() => router.push('/escolher-bairro')}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <AppIcon name="place" size={18} color={colors.onSurfaceVariant} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <AppIcon name="chevronDown" size={16} color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xxs,
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    marginHorizontal: -spacing.xs,
    borderRadius: metrics.touchTarget / 2,
  },
  pressed: { backgroundColor: colors.pressed },
  label: { ...typography.labelLarge, color: colors.onSurface, maxWidth: 160 },
});
