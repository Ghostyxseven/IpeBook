import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistory } from '../../../factories/reputation';
import type { HistoryEntry } from '../../../model/entities/Rating';
import { modalityLabels } from '../../../model/services/catalogFormat';
import { historyLine } from '../../../model/services/reputationFormat';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { RatingForm } from '../../components/profile/RatingForm';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Histórico de trocas, vendas e doações concluídas (spec 031).
 *
 * É também de onde a avaliação sai: avaliar faz sentido ao lado da negociação
 * que acabou, não numa tela separada onde a pessoa teria de lembrar qual foi.
 */
export function HistoryScreen() {
  const router = useRouter();
  const vm = useHistory();
  const [rating, setRating] = useState<string | null>(null);

  if (vm.status === 'loading') {
    return (
      <View style={styles.screen}>
        <LoadingState message="Carregando histórico…" />
      </View>
    );
  }

  if (vm.status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.brand}>
          O que já circulou.
        </Text>
        <Text style={styles.body}>Suas trocas, vendas e doações concluídas.</Text>

        <FormMessage tone="error" message={vm.actionError} />

        {vm.history.length === 0 ? (
          <EmptyState
            title="Nada concluído ainda"
            message="Quando uma negociação terminar, ela aparece aqui — e você pode avaliar quem encontrou."
            actionLabel="Explorar livros"
            onAction={() => router.push('/explorar')}
          />
        ) : (
          vm.history.map((entry) => (
            <Entry
              key={entry.requestId}
              entry={entry}
              open={rating === entry.requestId}
              submitting={vm.submitting}
              onOpen={() => setRating(entry.requestId)}
              onCancel={() => setRating(null)}
              onSubmit={async (score, comment) => {
                await vm.rate(entry, score, comment);
                setRating(null);
              }}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Entry({
  entry,
  open,
  submitting,
  onOpen,
  onCancel,
  onSubmit,
}: {
  entry: HistoryEntry;
  open: boolean;
  submitting: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onSubmit: (score: number, comment: string | null) => Promise<void>;
}) {
  const line = historyLine(entry);
  const when = new Date(entry.completedAt).toLocaleDateString('pt-BR');

  return (
    <View style={styles.card}>
      <Text style={styles.overline}>{`${modalityLabels[entry.modality]} · ${when}`}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {entry.title}
      </Text>
      <Text style={styles.body} numberOfLines={1}>
        {entry.author}
      </Text>
      <Text style={styles.line}>{line}</Text>

      {entry.rated ? (
        <Text style={styles.done}>Você já avaliou esta negociação.</Text>
      ) : !entry.otherPersonId ? (
        // A conta da outra pessoa foi excluída: não há a quem avaliar.
        <Text style={styles.done}>Esta pessoa não está mais na comunidade.</Text>
      ) : open ? (
        <RatingForm
          submitting={submitting}
          onSubmit={(score, comment) => void onSubmit(score, comment)}
          onCancel={onCancel}
        />
      ) : (
        <Button label="Avaliar" variant="secondary" onPress={onOpen} />
      )}
    </View>
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
  overline: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  title: { ...typography.titleMedium, color: colors.onSurface },
  line: { ...typography.bodyLarge, color: colors.onSurface, marginTop: spacing.xxs },
  done: { ...typography.labelLarge, color: colors.action, marginTop: spacing.xs },
});
