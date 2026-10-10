import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRatingsReceived } from '../../../factories/reputation';
import {
  averageLabel,
  completedLabel,
  personName,
  ratingLabel,
} from '../../../model/services/reputationFormat';
import { useSessionContext } from '../../../viewmodel/useSession';
import { AppIcon } from '../../components/AppIcon';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Avaliações recebidas (Figma 07.03).
 *
 * Serve às próprias e às de outra pessoa: sem o parâmetro `pessoa`, mostra as
 * de quem está na sessão. A tela é a mesma porque o conteúdo é o mesmo — quem
 * olha a própria reputação quer ver exatamente o que os outros veem.
 */
export function RatingsScreen() {
  const { pessoa } = useLocalSearchParams<{ pessoa?: string }>();
  const session = useSessionContext();
  const userId = pessoa ? String(pessoa) : (session.user?.id ?? '');
  const mine = !pessoa;
  const vm = useRatingsReceived(userId);

  if (vm.status === 'loading') {
    return (
      <View style={styles.screen}>
        <LoadingState message="Carregando avaliações…" />
      </View>
    );
  }

  if (vm.status === 'error' || !vm.profile) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        </View>
      </SafeAreaView>
    );
  }

  const { profile, ratings } = vm;
  const average = averageLabel(profile.ratingAverage);
  const who = mine ? 'suas trocas' : `as trocas de ${personName(profile.firstName)}`;

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.brand}>
          Confiança que circula.
        </Text>
        <Text style={styles.body}>{`O que a comunidade conta sobre ${who}.`}</Text>

        <View
          style={styles.summary}
          accessible
          accessibilityLabel={
            average
              ? `${average}. ${completedLabel(profile.completedCount)} na comunidade.`
              : `Ainda sem avaliações. ${completedLabel(profile.completedCount)} na comunidade.`
          }
        >
          {/* Sem nota não existe média: um "0,0 de 5" seria uma nota ruim dada
              a quem nunca fez nada de errado (ADR 0027). */}
          <Text style={styles.score}>{average ?? 'Ainda sem avaliações'}</Text>
          <Text
            style={styles.body}
          >{`${completedLabel(profile.completedCount)} na comunidade.`}</Text>
        </View>

        {ratings.length === 0 ? (
          <EmptyState
            title="Nenhuma avaliação ainda"
            message={
              mine
                ? 'Quando vocês concluírem uma negociação, a outra pessoa pode avaliar você aqui.'
                : 'Esta pessoa ainda não recebeu avaliações.'
            }
          />
        ) : (
          <>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Avaliações recentes
            </Text>
            {ratings.map((rating) => (
              <View
                key={rating.id}
                style={styles.item}
                accessible
                accessibilityLabel={`${ratingLabel(rating)}.${rating.comment ? ` ${rating.comment}` : ''}`}
              >
                <AppIcon name="checkCircle" size={20} color={colors.action} />
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{ratingLabel(rating)}</Text>
                  {rating.comment ? <Text style={styles.body}>{rating.comment}</Text> : null}
                </View>
              </View>
            ))}
          </>
        )}
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
    maxWidth: metrics.readingMaxWidth,
    alignSelf: 'center',
  },
  brand: { ...typography.brandTitle, color: colors.onSurface },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  summary: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.selected,
  },
  score: { ...typography.titleMedium, color: colors.onSelected },
  sectionTitle: { ...typography.titleMedium, color: colors.onSurface },
  item: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  itemText: { flex: 1, gap: spacing.xxs },
  itemTitle: { ...typography.bodyLarge, color: colors.onSurface },
});
