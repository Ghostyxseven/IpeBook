import { StyleSheet, View } from 'react-native';
import { badgeColors, colors, radius } from '../../theme/nativeTheme';
import { AppIcon, type AppIconName } from '../AppIcon';

/**
 * Ícone em quadrado colorido (Figma 07.01, 07.05 e 07.06, Perfil/Configurações/Segurança):
 * cada tom reaproveita um par de cores já existente (ação, badges de Troca e Doação, erro,
 * contêiner neutro) — não há cor nova, só uma forma nova de aplicar as que já existem.
 */
export type IconBadgeTone = 'action' | 'trade' | 'donation' | 'error' | 'neutral';

const tones: Record<IconBadgeTone, { background: string; icon: string }> = {
  action: { background: colors.action, icon: colors.surface },
  trade: { background: badgeColors.trade.background, icon: badgeColors.trade.text },
  donation: { background: badgeColors.donation.background, icon: badgeColors.donation.text },
  error: { background: colors.errorContainer, icon: colors.error },
  neutral: { background: colors.containerHigh, icon: colors.onSurfaceVariant },
};

export function IconBadge({ icon, tone }: { icon: AppIconName; tone: IconBadgeTone }) {
  const { background, icon: iconColor } = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <AppIcon name={icon} size={18} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
