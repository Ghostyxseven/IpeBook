import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { helpTopics } from '../../../model/services/helpTopics';
import { Button } from '../../components/ui/Button';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Ajuda (Figma 09.01). Os textos vivem em `helpTopics`; aqui só se desenha. */
export function HelpScreen() {
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
  actionBar: {
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
});
