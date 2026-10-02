import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookRequestDetail } from '../../../factories/bookRequest';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import { ListingCover } from '../../components/catalog/ListingCover';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import {
  meetingDateLabel,
  meetingSummary,
  meetingTimeLabel,
  requestStatusLabel,
} from '../../../model/services/bookRequestFormat';
import { FormMessage } from '../../components/ui/FormMessage';

/**
 * Detalhe da solicitação (requerente OU dono visualizam este tela com ações
 * (aceitar, recusar, cancelar, confirmar conclusão).
 */
export function BookRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useBookRequestDetail(String(id ?? ''));

  if (vm.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Carregando negociação…" />
      </View>
    );
  }

  if (vm.status === 'notFound') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <EmptyState
            title="Solicitação não encontrada"
            message={vm.error ?? ''}
            actionLabel="Ver minhas negociações"
            onAction={() => router.replace('/negociacoes')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (vm.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        </View>
      </SafeAreaView>
    );
  }

  const { request, listing, capabilities } = vm;
  if (!request || !listing) return null;

  const badgeVariant =
    request.status === 'accepted'
      ? 'reserved'
      : request.status === 'completed'
        ? 'completed'
        : request.status === 'pending'
          ? 'available'
          : 'archived';

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <ListingCover listing={listing} variant="tile" />
          <View style={styles.heroText}>
            <Text style={styles.bookTitle}>{listing.title}</Text>
            <Text style={styles.bookAuthor}>{listing.author}</Text>
            <View style={{ marginTop: spacing.xxs, alignSelf: 'flex-start' }}>
              <StatusBadge variant={badgeVariant as any} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Situação</Text>
          <Text style={styles.sectionValue}>{requestStatusLabel(request.status)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Encontro proposto</Text>
          <Text style={styles.meetingSummary}>{meetingSummary(request)}</Text>
          <View style={styles.metaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Local</Text>
              <Text style={styles.metaValue}>{request.publicLocation}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Dia</Text>
              <Text style={styles.metaValue}>{meetingDateLabel(request.meetingDate)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Horário</Text>
              <Text style={styles.metaValue}>{meetingTimeLabel(request.meetingTime)}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>
                {capabilities.asOwner ? 'Requerente' : 'Dono do livro'}
              </Text>
              <Text style={styles.metaValue}>
                {capabilities.asOwner
                  ? (listing.ownerFirstName ?? '—')
                  : (listing.ownerFirstName ?? '—')}
              </Text>
            </View>
          </View>
        </View>

        {vm.error ? <FormMessage tone="error" message={vm.error} /> : null}

        <View style={styles.actions}>
          {capabilities.canAccept ? (
            <Button
              label="Aceitar proposta"
              onPress={() => vm.accept()}
              loading={vm.busy}
              variant="primary"
            />
          ) : null}
          {capabilities.canReject ? (
            <Button
              label="Recusar"
              onPress={() => vm.reject()}
              loading={vm.busy}
              variant="secondary"
            />
          ) : null}
          {capabilities.canCancel ? (
            <Button
              label="Cancelar solicitação"
              onPress={() => vm.cancel()}
              loading={vm.busy}
              variant="text"
            />
          ) : null}
          {capabilities.canComplete ? (
            <Button
              label="Confirmar conclusão"
              onPress={() => vm.complete()}
              loading={vm.busy}
              variant="primary"
            />
          ) : null}
          {!capabilities.canAccept &&
          !capabilities.canReject &&
          !capabilities.canCancel &&
          !capabilities.canComplete ? (
            <Button label="Voltar" onPress={() => router.back()} variant="secondary" />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    paddingTop: spacing.md,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
    paddingBottom: spacing.lg,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.background,
  },
  heroText: { flex: 1, gap: spacing.xxs },
  bookTitle: { ...typography.titleMedium, fontWeight: '600', color: colors.text },
  bookAuthor: { ...typography.bodyLarge, color: colors.secondaryText },
  section: { gap: spacing.xxs },
  sectionTitle: { ...typography.labelMedium, color: colors.secondaryText },
  sectionValue: { ...typography.titleMedium, color: colors.text },
  card: {
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardTitle: { ...typography.titleMedium, fontWeight: '600', color: colors.text },
  meetingSummary: { ...typography.bodyLarge, color: colors.text },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxs,
  },
  metaLabel: { ...typography.caption, color: colors.secondaryText },
  metaValue: { ...typography.bodyMedium, color: colors.text },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
