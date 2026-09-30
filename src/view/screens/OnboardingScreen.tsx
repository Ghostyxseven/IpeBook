import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../factories/auth';
import { Button } from '../components/ui/Button';
import { colors, metrics, spacing, typography } from '../theme/nativeTheme';

export function OnboardingScreen() {
  const router = useRouter();
  const vm = useOnboarding({ onFinish: () => router.replace('/entrar') });
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        {!vm.isLast && (
          <Button
            label="Pular"
            variant="text"
            onPress={vm.skip}
            accessibilityHint="Vai para Entrar"
          />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.step}>
          {vm.index + 1} de {vm.total}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {vm.page.title}
        </Text>
        <Text style={styles.description}>{vm.page.description}</Text>
        <View
          style={styles.dots}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {Array.from({ length: vm.total }, (_, i) => (
            <View key={i} style={[styles.dot, i === vm.index && styles.dotActive]} />
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label={vm.isLast ? 'Começar' : 'Próxima'} onPress={vm.next} />
        {!vm.isFirst && <Button label="Voltar" variant="secondary" onPress={vm.back} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, padding: metrics.pagePadding },
  top: { minHeight: metrics.touchTarget, alignItems: 'flex-end' },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  step: { ...typography.caption, color: colors.secondaryText },
  title: { ...typography.title, color: colors.text },
  description: { ...typography.body, color: colors.secondaryText },
  dots: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  dot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: spacing.xxs,
    backgroundColor: colors.border,
  },
  dotActive: { width: spacing.lg, backgroundColor: colors.action },
  actions: { gap: spacing.sm, width: '100%', maxWidth: metrics.formMaxWidth, alignSelf: 'center' },
});
