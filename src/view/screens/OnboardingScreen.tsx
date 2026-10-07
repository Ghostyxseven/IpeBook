import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../factories/auth';
import { Button } from '../components/ui/Button';
import { Wordmark } from '../components/ui/Wordmark';
import { colors, metrics, radius, spacing, typography } from '../theme/nativeTheme';

const illustration = require('../../../assets/images/boas-vindas-classicos.png');

/** Boas-vindas (Figma 01.01): marca, cidade, título com destaque, ilustração e ações. */
export function OnboardingScreen() {
  const router = useRouter();
  const vm = useOnboarding({
    onStart: () => router.replace('/criar-conta'),
    onSignIn: () => router.replace('/entrar'),
  });
  const { content } = vm;
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.top}>
            <Wordmark underline={false} />
            <View style={styles.place} accessibilityLabel={`Cidade: ${content.place}`}>
              <View style={styles.dot} />
              <Text style={styles.placeText}>{content.place.toUpperCase()}</Text>
            </View>
          </View>
          <Text
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel={`${content.title} ${content.highlight}`}
          >
            {content.title}
            {'\n'}
            <Text style={styles.highlight}>{content.highlight}</Text>
          </Text>
          <Image
            source={illustration}
            style={styles.illustration}
            contentFit="contain"
            accessibilityLabel={content.illustrationLabel}
          />
          <Text style={styles.description}>{content.description}</Text>
          <View
            style={styles.modalities}
            accessibilityLabel={`Modalidades: ${content.modalities.join(', ')}`}
          >
            {content.modalities.map((name) => (
              <View key={name} style={styles.modality}>
                <Text style={styles.modalityText}>{name}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Button label="Começar" onPress={vm.start} accessibilityHint="Vai para Criar conta" />
            <Button label="Já tenho conta" variant="secondary" onPress={vm.signIn} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, padding: metrics.pagePadding },
  content: {
    flex: 1,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.containerHigh,
  },
  dot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.action,
  },
  placeText: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  title: { ...typography.brandLargeTitle, color: colors.onSurface, marginTop: spacing.sm },
  highlight: { backgroundColor: colors.tertiaryContainer, borderRadius: radius.small },
  // A ilustração do Figma ocupa 360 × 360 px; aqui ela acompanha a largura e mantém o quadrado.
  // A imagem tem margem transparente; no Figma ela avança sobre o título e o texto.
  illustration: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 360,
    alignSelf: 'center',
    marginVertical: -spacing.xl,
  },
  description: { ...typography.bodyLarge, color: colors.onSurfaceVariant, zIndex: 1 },
  modalities: { flexDirection: 'row', gap: spacing.xs },
  modality: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.small,
    borderWidth: metrics.borderThin,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.containerLowest,
  },
  modalityText: { ...typography.labelLarge, color: colors.onSurfaceVariant },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
