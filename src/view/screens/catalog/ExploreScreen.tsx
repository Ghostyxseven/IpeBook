import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Modality } from '../../../model/entities/Listing';
import { modalityLabels } from '../../../model/services/catalogFormat';
import { useCatalogSearch } from '../../../factories/catalog';
import { CatalogList } from '../../components/catalog/CatalogList';
import { ModalityChip } from '../../components/catalog/ModalityChip';
import { SearchBarInput } from '../../components/catalog/SearchBar';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { parseModality } from './routeParams';

const modalities: Modality[] = ['sale', 'trade', 'donation'];

/** Explorar (Figma 03, 12 e 26 a 28): busca, modalidades e lista de livros. */
export function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ modalidade?: string; atalho?: string }>();
  const shortcut = parseModality(params.modalidade);
  const vm = useCatalogSearch(shortcut);
  const { showOnly } = vm;

  // Cada atalho do Início reaplica a modalidade, mesmo quando ela se repete.
  useEffect(() => {
    if (params.atalho) showOnly(shortcut);
  }, [params.atalho, shortcut, showOnly]);

  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header" accessibilityLiveRegion="polite">
        {vm.title}
      </Text>
      <SearchBarInput value={vm.query} onChangeText={vm.setQuery} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        accessibilityLabel="Modalidades"
      >
        {modalities.map((modality) => (
          <ModalityChip
            key={modality}
            modality={modality}
            label={modalityLabels[modality]}
            selected={vm.modalities.includes(modality)}
            onPress={() => vm.toggleModality(modality)}
          />
        ))}
      </ScrollView>
      {vm.status === 'ready' && vm.items.length > 0 && (
        <Text style={styles.summary} accessibilityLiveRegion="polite">
          {vm.summary}
        </Text>
      )}
      {vm.status === 'ready' && vm.error && <FormMessage tone="error" message={vm.error} />}
    </View>
  );

  const empty =
    vm.status === 'loading' ? (
      <LoadingState message="Buscando livros…" />
    ) : vm.status === 'error' ? (
      <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
    ) : vm.searching ? (
      <View style={styles.noResults}>
        <View style={styles.noResultsCard}>
          <Text style={styles.noResultsTitle}>Uma nova leitura pode estar a um toque.</Text>
          <Text style={styles.noResultsText}>
            Tente outro título, procure pelo autor ou explore todos os livros.
          </Text>
        </View>
        <Button label="Explorar todos os livros" onPress={vm.clear} />
      </View>
    ) : (
      <EmptyState
        title="Ainda não há livros anunciados"
        message="Quando alguém anunciar um livro, ele aparece aqui."
      />
    );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CatalogList
        items={vm.status === 'loading' ? [] : vm.items}
        header={header}
        empty={empty}
        footer={
          vm.searching && vm.items.length > 0 && !vm.hasMore ? (
            <View style={styles.footer}>
              <Button
                label={vm.activeFilterCount > 1 ? 'Limpar filtros' : 'Limpar filtro'}
                variant="secondary"
                onPress={vm.clear}
              />
            </View>
          ) : null
        }
        refreshing={vm.refreshing}
        loadingMore={vm.loadingMore}
        loadMoreError={vm.loadMoreError}
        onRefresh={vm.refresh}
        onEndReached={vm.loadMore}
        onOpen={(id) => router.push({ pathname: '/livro/[id]', params: { id } })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { gap: spacing.xs, paddingBottom: spacing.xxs },
  title: { ...typography.displayLarge, color: colors.text },
  chips: { flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.md },
  summary: { ...typography.labelMedium, color: colors.secondaryText },
  noResults: { gap: spacing.md },
  noResultsCard: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.background,
  },
  noResultsTitle: { ...typography.titleLarge, fontWeight: '400', color: colors.text },
  noResultsText: { ...typography.bodyLarge, fontWeight: '500', color: colors.text },
  footer: { paddingTop: spacing.md },
});
