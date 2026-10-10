import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { helpSteps, helpTopics, safetyTips } from '../../../model/services/helpTopics';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/ui/Button';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const ios = Platform.OS === 'ios';

/**
 * Ajuda (Figma 09.01). No Android e na Web é o FAQ de `helpTopics`; no iPhone são os três
 * passos numerados de `helpSteps` e as dicas de `safetyTips` — quadro atual do Figma, que
 * substituiu o FAQ só para essa plataforma. Os textos vivem no model; aqui só se desenha.
 */
export function HelpScreen() {
  return ios ? <IOSHelpScreen /> : <FAQHelpScreen />;
}

function FAQHelpScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.brand}>
          Vamos ajudar.
        </Text>
        <Text style={styles.body}>Respostas para continuar sua próxima leitura.</Text>
        {helpTopics.map((topic) => (
          <View
            key={topic.id}
            style={styles.card}
            accessible
            accessibilityLabel={`${topic.question} ${topic.answer}`}
          >
            <Text style={styles.cardTitle}>{topic.question}</Text>
            <Text style={styles.body}>{topic.answer}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.actionBar}>
        <Button
          label="Abrir conversas"
          variant="secondary"
          onPress={() => router.push('/conversas')}
        />
      </View>
    </SafeAreaView>
  );
}

function IOSHelpScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {helpSteps.map((step, index) => (
          <View
            key={step.id}
            style={styles.stepCard}
            accessible
            accessibilityLabel={`Passo ${index + 1}. ${step.title}. ${step.description}`}
          >
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.body}>{step.description}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.sectionLabel} accessibilityRole="header">
          Segurança
        </Text>
        <View style={styles.tipGroup}>
          {safetyTips.map((tip, index) => (
            <View key={tip.id}>
              {index > 0 ? <View style={styles.tipSeparator} /> : null}
              <View style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <AppIcon name={tip.icon} size={18} color={colors.onSelected} />
                </View>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.note}>Viu algo estranho? Use Denunciar no anúncio ou na conversa.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  brand: { ...typography.brandTitle, color: colors.onSurface },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  card: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface },
  // Passos numerados (Figma 09.01, iPhone): um cartão por passo, número em círculo à esquerda.
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  stepBadge: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: spacing.xl / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.selected,
  },
  stepNumber: { ...typography.titleMedium, color: colors.onSelected },
  stepCopy: { flex: 1, gap: spacing.xxs },
  stepTitle: { ...typography.titleMedium, color: colors.onSurface },
  sectionLabel: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  // Lista agrupada do iOS (mesmo padrão de `RadioListItem.tsx`): cantos de 12 e separador recuado.
  tipGroup: {
    borderRadius: metrics.fieldRadius,
    overflow: 'hidden',
    backgroundColor: colors.iosCell,
  },
  tipSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md,
    backgroundColor: colors.iosSeparator,
  },
  tipRow: {
    minHeight: metrics.touchTarget + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tipIcon: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.selected,
  },
  tipText: { ...typography.iosBody, color: colors.onSurface, flex: 1 },
  note: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  actionBar: {
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
});
