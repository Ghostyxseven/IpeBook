import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModerationReports } from '../../../factories/security';
import {
  formatReportDate,
  personName,
  reportStatusLabel,
  reportTargetLabel,
} from '../../../model/services/securityFormat';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormMessage } from '../../components/ui/FormMessage';
import { TopAppBar } from '../../components/ui/TopAppBar';
import { useWebLayout } from '../../hooks/useWebLayout';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

export default function ModerationReportsScreen() {
  const { large } = useWebLayout();
  const router = useRouter();
  const vm = useModerationReports();
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/configuracoes'));

  let body;
  if (vm.status === 'loading') {
    body = <LoadingState message="Carregando denúncias para moderação…" />;
  } else if (vm.status === 'unauthorized') {
    body = (
      <View style={styles.centerBox}>
        <Text accessibilityRole="header" style={styles.brand}>
          Acesso restrito.
        </Text>
        <Text style={styles.body}>Esta área é restrita aos moderadores da comunidade.</Text>
      </View>
    );
  } else if (vm.status === 'error') {
    body = <ErrorState message={vm.loadError ?? ''} onRetry={vm.retry} />;
  } else if (vm.totalEmpty) {
    body = (
      <View style={styles.centerBox}>
        <Text accessibilityRole="header" style={styles.brand}>
          Nenhuma denúncia.
        </Text>
        <Text style={styles.body}>A comunidade está tranquila no momento.</Text>
      </View>
    );
  } else {
    body = (
      <ScrollView contentContainerStyle={[styles.content, large && styles.desktopContent]}>
        <View style={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pendentes (${vm.counts.pending})`}
            accessibilityState={{ selected: vm.filter === 'pending' }}
            onPress={() => vm.setFilter('pending')}
            style={({ focused }: { pressed: boolean; focused?: boolean }) => [
              styles.filterChip,
              vm.filter === 'pending' && styles.filterChipActive,
              focused && styles.focused,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                vm.filter === 'pending' && styles.filterChipTextActive,
              ]}
            >
              Pendentes ({vm.counts.pending})
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Resolvidas (${vm.counts.resolved})`}
            accessibilityState={{ selected: vm.filter === 'resolved' }}
            onPress={() => vm.setFilter('resolved')}
            style={({ focused }: { pressed: boolean; focused?: boolean }) => [
              styles.filterChip,
              vm.filter === 'resolved' && styles.filterChipActive,
              focused && styles.focused,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                vm.filter === 'resolved' && styles.filterChipTextActive,
              ]}
            >
              Resolvidas ({vm.counts.resolved})
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Todas (${vm.counts.total})`}
            accessibilityState={{ selected: vm.filter === 'all' }}
            onPress={() => vm.setFilter('all')}
            style={({ focused }: { pressed: boolean; focused?: boolean }) => [
              styles.filterChip,
              vm.filter === 'all' && styles.filterChipActive,
              focused && styles.focused,
            ]}
          >
            <Text
              style={[styles.filterChipText, vm.filter === 'all' && styles.filterChipTextActive]}
            >
              Todas ({vm.counts.total})
            </Text>
          </Pressable>
        </View>

        <FormMessage tone="error" message={vm.error} />

        {vm.empty ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {vm.filter === 'pending'
                ? 'Nenhuma denúncia pendente.'
                : 'Nenhuma denúncia encontrada para este filtro.'}
            </Text>
          </View>
        ) : (
          <View style={[styles.cards, large && styles.desktopCards]}>
            {vm.reports.map((report) => {
              const isResolved = report.status === 'resolved';
              return (
                <View
                  key={report.id}
                  style={[styles.card, large && styles.desktopCard]}
                  accessible
                  accessibilityLabel={`${reportTargetLabel(report)}, motivo: ${report.reason}, status: ${reportStatusLabel(report.status)}`}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTarget}>{reportTargetLabel(report)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isResolved ? styles.statusBadgeResolved : styles.statusBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isResolved
                            ? styles.statusBadgeTextResolved
                            : styles.statusBadgeTextPending,
                        ]}
                      >
                        {reportStatusLabel(report.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardSection}>
                    <Text style={styles.reasonLabel}>Motivo</Text>
                    <Text style={styles.reasonValue}>{report.reason}</Text>
                  </View>

                  {report.details ? (
                    <View style={styles.cardSection}>
                      <Text style={styles.reasonLabel}>Detalhes informados</Text>
                      <Text style={styles.detailsValue}>{report.details}</Text>
                    </View>
                  ) : null}

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      Denunciado por: {personName(report.reporterFirstName)}
                    </Text>
                    <Text style={styles.metaText}>{formatReportDate(report.createdAt)}</Text>
                  </View>

                  {!isResolved && (
                    <View style={styles.actionRow}>
                      <Button
                        label="Marcar como resolvida"
                        variant="secondary"
                        onPress={() => vm.askResolve(report)}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TopAppBar title="Painel de moderação" onBack={leave} />
      {body}
      <ConfirmDialog
        visible={vm.confirming !== null}
        title="Marcar denúncia como resolvida?"
        message="A denúncia será marcada como concluída e arquivada para histórico."
        confirmLabel="Marcar como resolvida"
        onConfirm={vm.confirmResolve}
        onCancel={vm.cancelResolve}
        busy={vm.resolving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    maxWidth: metrics.readingMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  desktopContent: { maxWidth: metrics.contentMaxWidth },
  cards: { gap: spacing.md },
  desktopCards: { flexDirection: 'row', flexWrap: 'wrap' },
  desktopCard: { width: '48%' },
  centerBox: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.xl,
    gap: spacing.md,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  brand: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterChip: {
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.containerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focused: {
    outlineColor: colors.focus,
    outlineStyle: 'solid',
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  filterChipActive: {
    backgroundColor: colors.action,
  },
  filterChipText: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: colors.containerLowest,
  },
  emptyCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: metrics.cardRadius,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: metrics.cardRadius,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTarget: {
    ...typography.titleMedium,
    color: colors.onSurface,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.small,
  },
  statusBadgePending: {
    backgroundColor: colors.containerHigh,
  },
  statusBadgeResolved: {
    backgroundColor: colors.containerLow,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  statusBadgeTextPending: {
    color: colors.actionDeep,
  },
  statusBadgeTextResolved: {
    color: colors.success,
  },
  cardSection: {
    gap: spacing.xxs,
  },
  reasonLabel: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
  },
  reasonValue: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    fontWeight: '500',
  },
  detailsValue: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  actionRow: {
    paddingTop: spacing.xs,
  },
});
