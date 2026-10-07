import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistory } from '../../../factories/reputation';
import type { HistoryEntry } from '../../../model/entities/Rating';
import { modalityLabels } from '../../../model/services/catalogFormat';
import { historyLine } from '../../../model/services/reputationFormat';
import { ChoiceChips } from '../../components/listings/ChoiceChips';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** O limite que o banco aceita no comentário (`check` de 3 a 280). */
const COMMENT_LIMIT = 280;

const scores = ['1', '2', '3', '4', '5'] as const;

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
  const [score, setScore] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const line = historyLine(entry);
  const when = new Date(entry.completedAt).toLocaleDateString('pt-BR');
  // O banco recusa comentário com 1 ou 2 caracteres; a tela não oferece o envio.
  const commentIsShort = comment.trim().length > 0 && comment.trim().length < 3;

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
        <View style={styles.form}>
          <ChoiceChips
            label="Que nota você dá para este encontro?"
            options={scores.map((value) => ({ value, label: `${value}` }))}
            value={score}
            onChange={setScore}
          />
          <View>
            <TextField
              label="Comentário (opcional)"
              value={comment}
              onChangeText={setComment}
              editable={!submitting}
              multiline
              numberOfLines={3}
              maxLength={COMMENT_LIMIT}
              error={
                commentIsShort ? 'Escreva pelo menos três letras, ou deixe em branco.' : undefined
              }
              placeholder="Pontual e cuidadoso com os livros."
            />
            <Text style={styles.counter}>{`${comment.length}/${COMMENT_LIMIT}`}</Text>
          </View>
          <Text style={styles.body}>A avaliação é pública e não dá para editar depois.</Text>
          <Button
            label="Enviar avaliação"
            loading={submitting}
            disabled={!score || commentIsShort}
            onPress={() => {
              if (!score) return;
              void onSubmit(Number(score), comment.trim() || null);
            }}
          />
          <Button label="Agora não" variant="text" onPress={onCancel} disabled={submitting} />
        </View>
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
  form: { gap: spacing.sm, marginTop: spacing.xs },
  counter: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
    marginTop: spacing.xxs,
  },
});
