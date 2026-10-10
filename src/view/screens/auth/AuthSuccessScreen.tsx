import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { afterSignIn } from '../../../viewmodel/afterSignIn';
import { Button } from '../../components/ui/Button';
import { TopAppBar } from '../../components/ui/TopAppBar';
import { useWebLayout } from '../../hooks/useWebLayout';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

type Action = { label: string; onPress: () => void };

/**
 * Confirmação depois de um passo de acesso (Figma 01.09 Senha atualizada e 01.13 E-mail
 * confirmado): barra com voltar, título de marca, explicação, cartão opcional e ações.
 */
export function AuthSuccessScreen({
  barTitle,
  title,
  description,
  card,
  primary,
  secondary,
  onBack,
}: {
  barTitle: string;
  title: string;
  description: string;
  card?: { title: string; text: string };
  primary: Action;
  secondary?: Action;
  onBack: () => void;
}) {
  const { large } = useWebLayout();
  // A tela já apareceu: a próxima entrada volta a ir direto para a Início.
  useEffect(() => afterSignIn.clear(), []);
  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar title={barTitle} onBack={onBack} />
      <ScrollView contentContainerStyle={[styles.scroll, large && styles.desktopScroll]}>
        <View style={[styles.content, large && styles.desktopContent]}>
          <View style={[styles.header, large && styles.desktopHeader]}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <View style={[styles.actions, large && styles.desktopActions]}>
            {card && (
              <View style={styles.card} accessibilityRole="summary">
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardText}>{card.text}</Text>
              </View>
            )}
            <Button label={primary.label} onPress={primary.onPress} />
            {secondary && (
              <Button label={secondary.label} variant="text" onPress={secondary.onPress} />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, padding: metrics.pagePadding },
  desktopScroll: { justifyContent: 'center' },
  content: { width: '100%', maxWidth: metrics.formMaxWidth, alignSelf: 'center', gap: spacing.md },
  desktopContent: {
    maxWidth: metrics.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: { gap: spacing.md },
  desktopHeader: {
    flex: 1,
    minWidth: 0,
    padding: spacing.xl,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.containerLow,
  },
  actions: { gap: spacing.md },
  desktopActions: { flex: 1, minWidth: 0, maxWidth: metrics.formMaxWidth },
  title: { ...typography.brandHeadline, color: colors.onSurface },
  description: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  // Cartão preenchido do Material 3 no verde de seleção (Figma 01.09).
  card: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.selected,
  },
  cardTitle: { ...typography.titleMedium, color: colors.onSelected },
  cardText: { ...typography.bodyMedium, color: colors.onSelected },
});
