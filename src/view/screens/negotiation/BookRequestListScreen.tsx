import { Link, router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookRequestList } from '../../../factories/bookRequest';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import {
  meetingSummary,
  requestListLabel,
  requestStatusLabel,
} from '../../../model/services/bookRequestFormat';

/**
 * Lista de solicitações do usuário logado:
 * - enviadas (onde eu sou requerente)
 * - recebidas (onde eu sou dono do anúncio)
 */
export function BookRequestListScreen() {
  const vm = useBookRequestList();

  if (vm.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Carregando negociações…" />
      </View>
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

  if (vm.status === 'empty') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <EmptyState
            title="Nenhuma negociação"
            message="Quando você pedir um livro ou receber uma solicitação, ela aparecerá aqui."
            actionLabel="Explorar livros"
            onAction={() => router.replace('/explorar')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Minhas negociações
          </Text>
          {vm.counts.pending > 0 ? (
            <Text style={styles.subtitle}>
              {`${vm.counts.pending} aguardando`}
              {vm.counts.accepted > 0 ? ` • ${vm.counts.accepted} combinada(s)` : ''}
            </Text>
          ) : vm.counts.accepted > 0 ? (
            <Text style={styles.subtitle}>{`${vm.counts.accepted} combinada(s)`}</Text>
          ) : null}
        </View>
        <FlatList
          data={vm.items}
          keyExtractor={(item) => item.request.id}
          contentContainerStyle={{ gap: spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => {
            const { request, listing, asOwner } = item;
            const variant =
              request.status === 'accepted'
                ? 'reserved'
                : request.status === 'pending'
                  ? asOwner
                    ? 'reserved'
                    : 'available'
                  : request.status === 'completed'
                    ? 'completed'
                    : 'archived';
            return (
              <Link href={`/negociacoes/${request.id}`} asChild>
                <Pressable
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel={`${listing?.title ?? 'Livro'} — ${requestStatusLabel(request.status)}. ${meetingSummary(request)}`}
                  accessibilityHint="Abrir detalhes"
                >
                  <View style={{ flex: 1, gap: spacing.xxs }}>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {listing?.title ?? 'Livro indisponível'}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {listing?.author ?? ''}
                    </Text>
                    <Text style={styles.meeting}>{meetingSummary(request)}</Text>
                  </View>
                  <View style={styles.side}>
                    <StatusBadge variant={variant as any} />
                    <Text style={styles.statusLabel}>{requestListLabel(request, { asOwner })}</Text>
                  </View>
                </Pressable>
              </Link>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    flex: 1,
    padding: metrics.pagePadding,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  header: { gap: spacing.xxs, paddingTop: spacing.sm },
  title: { ...typography.titleLarge, color: colors.text },
  subtitle: { ...typography.labelMedium, color: colors.secondaryText },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.background,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    minHeight: metrics.touchTarget,
  },
  bookTitle: { ...typography.titleMedium, fontWeight: '600', color: colors.text },
  bookAuthor: { ...typography.bodyMedium, color: colors.secondaryText },
  meeting: { ...typography.bodyMedium, color: colors.text },
  side: { alignItems: 'flex-end', gap: spacing.xxs },
  statusLabel: { ...typography.caption, color: colors.secondaryText },
});
