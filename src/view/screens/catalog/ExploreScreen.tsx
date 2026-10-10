import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import sublinhadoMarca from '../../../../assets/catalog/sublinhado-marca.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Modality } from '../../../model/entities/Listing';
import { conditionLabels, modalityLabels } from '../../../model/services/catalogFormat';
import { maxPriceLabel } from '../../../model/services/catalogFilters';
import { categories } from '../../../model/services/categories';
import { useCatalogSearch } from '../../../factories/catalog';
import { useFavorites } from '../../../factories/favorites';
import { useWebLayout } from '../../hooks/useWebLayout';
import { AppIcon } from '../../components/AppIcon';
import { BooksMap } from '../../components/maps/BooksMap';
import { CatalogList } from '../../components/catalog/CatalogList';
import { FilterModal } from '../../components/catalog/FilterModal';
import { ModalityChip } from '../../components/catalog/ModalityChip';
import { NeighborhoodChip } from '../../components/catalog/NeighborhoodChip';
import { SearchBarInput } from '../../components/catalog/SearchBar';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { parseModality } from './routeParams';

const modalities: Modality[] = ['sale', 'trade', 'donation'];

/** Explorar (Figma 02.02, iOS 70:1313 e Android 10:2): busca, modalidades e lista de livros. */
export function ExploreScreen() {
  const { large } = useWebLayout();
  const router = useRouter();
  const params = useLocalSearchParams<{ modalidade?: string; atalho?: string }>();
  const shortcut = parseModality(params.modalidade);
  const vm = useCatalogSearch(shortcut);
  const { showOnly } = vm;
  const favorites = useFavorites();

  // Cada atalho do Início reaplica a modalidade, mesmo quando ela se repete.
  useEffect(() => {
    if (params.atalho) showOnly(shortcut);
  }, [params.atalho, shortcut, showOnly]);

  const [filtering, setFiltering] = useState(false);
  const filterCount =
    vm.modalities.length +
    (vm.category ? 1 : 0) +
    vm.conditions.length +
    (vm.maxPriceCents != null ? 1 : 0);
  const applied = {
    modalities: vm.modalities,
    category: vm.category,
    conditions: vm.conditions,
    maxPriceCents: vm.maxPriceCents,
  };

  const header = (
    <View style={styles.header}>
      {/* Figma 02.02: bairro de quem está logado à esquerda, filtros à direita. */}
      <View style={styles.topRow}>
        <NeighborhoodChip />
        {!large && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              filterCount ? `Filtrar livros, ${filterCount} filtros ativos` : 'Filtrar livros'
            }
            onPress={() => setFiltering(true)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <AppIcon name="tune" color={colors.onSurfaceVariant} />
          </Pressable>
        )}
      </View>
      {!vm.searching && (
        <>
          <Text style={styles.title} accessibilityRole="header" accessibilityLiveRegion="polite">
            {vm.title}
          </Text>
          {/* Só no título padrão: as variações por modalidade não têm o quadro do Figma. */}
          {vm.title === 'O que vamos ler hoje?' && (
            <Image
              source={sublinhadoMarca}
              style={styles.underline}
              contentFit="contain"
              accessible={false}
            />
          )}
          <Text style={styles.subtitle}>
            Livros novos e seminovos para trocar, comprar ou receber aqui perto.
          </Text>
        </>
      )}
      <SearchBarInput value={vm.query} onChangeText={vm.setQuery} />
      <Button
        label={vm.mapMode ? 'Ver livros na lista' : 'Ver livros no mapa'}
        variant="secondary"
        onPress={() => vm.setMapMode(!vm.mapMode)}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.bleed}
        accessibilityLabel={vm.searching ? 'Modalidades' : 'Categorias'}
      >
        {vm.searching ? (
          <>
            {/* Figma 02.04: com filtro, a linha troca para modalidades e os filtros removíveis. */}
            <ModalityChip
              modality="all"
              label="Todos"
              selected={vm.modalities.length === 0}
              onPress={() => showOnly(null)}
            />
            {modalities.map((modality) => (
              <ModalityChip
                key={modality}
                modality={modality}
                label={modalityLabels[modality]}
                selected={vm.modalities.includes(modality)}
                onPress={() => vm.toggleModality(modality)}
              />
            ))}
            {vm.category ? (
              <ModalityChip
                modality="all"
                label={vm.category}
                selected
                removable
                onPress={() => vm.selectCategory(null)}
              />
            ) : null}
            {vm.conditions.map((condition) => (
              <ModalityChip
                key={condition}
                modality="all"
                label={conditionLabels[condition]}
                selected
                removable
                onPress={() =>
                  vm.applyFilters({
                    ...applied,
                    conditions: vm.conditions.filter((item) => item !== condition),
                  })
                }
              />
            ))}
            {vm.maxPriceCents != null ? (
              <ModalityChip
                modality="all"
                label={maxPriceLabel(vm.maxPriceCents)}
                selected
                removable
                onPress={() => vm.applyFilters({ ...applied, maxPriceCents: null })}
              />
            ) : null}
          </>
        ) : (
          <>
            {/* Figma 02.02: sem filtro, os chips são as categorias. */}
            <ModalityChip
              modality="all"
              label="Todos"
              selected={vm.category === null}
              onPress={() => vm.selectCategory(null)}
            />
            {categories.map((category) => (
              <ModalityChip
                key={category}
                modality="all"
                label={category}
                selected={vm.category === category}
                onPress={() => vm.selectCategory(category)}
              />
            ))}
          </>
        )}
      </ScrollView>
      {vm.searching && vm.status === 'ready' && vm.items.length > 0 && (
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
      <View style={[styles.body, large && styles.desktopBody]}>
        {large && (
          <FilterModal
            embedded
            visible
            initial={applied}
            countFor={vm.countFor}
            onClose={() => undefined}
            onApply={vm.applyFilters}
          />
        )}
        <View style={styles.results}>
          {vm.mapMode ? (
            <ScrollView contentContainerStyle={styles.mapContent}>
              {header}
              {vm.status === 'loading' || vm.status === 'error' ? (
                empty
              ) : (
                <BooksMap
                  items={vm.items}
                  onOpen={(id) => router.push({ pathname: '/livro/[id]', params: { id } })}
                />
              )}
              {vm.loadMoreError ? <FormMessage tone="error" message={vm.loadMoreError} /> : null}
              {vm.hasMore ? (
                <Button
                  label="Carregar mais livros no mapa"
                  loading={vm.loadingMore}
                  onPress={vm.loadMore}
                />
              ) : null}
              <Button
                label="Atualizar livros"
                variant="text"
                loading={vm.refreshing}
                onPress={vm.refresh}
              />
            </ScrollView>
          ) : (
            <CatalogList
              items={vm.status === 'loading' ? [] : vm.items}
              header={header}
              empty={empty}
              isFavorite={favorites.isFavorite}
              onToggleFavorite={favorites.toggle}
              footer={
                vm.searching && vm.items.length > 0 && !vm.hasMore ? (
                  <View style={styles.footer}>
                    <Button
                      label={vm.activeFilterCount > 1 ? 'Limpar filtros' : 'Limpar filtro'}
                      variant="text"
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
          )}
        </View>
      </View>
      {!large && (
        <FilterModal
          visible={filtering}
          initial={applied}
          countFor={vm.countFor}
          onClose={() => setFiltering(false)}
          onApply={(draft) => {
            vm.applyFilters(draft);
            setFiltering(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  desktopBody: { flexDirection: 'row' },
  results: { flex: 1, minWidth: 0 },
  mapContent: { padding: metrics.pagePadding, gap: spacing.md },
  safe: { flex: 1, backgroundColor: colors.surface },
  // O título e a busca ficam na margem da página; os cards da lista, mais perto da borda (Figma).
  header: {
    gap: spacing.sm,
    paddingHorizontal: metrics.pagePadding - spacing.md,
    paddingBottom: spacing.xxs,
  },
  title: { ...typography.brandHeadline, color: colors.onSurface },
  subtitle: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  underline: { width: 220, height: 12, marginTop: -spacing.xs },
  iconButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: metrics.touchTarget / 2,
  },
  pressed: { backgroundColor: colors.pressed },
  bleed: { marginHorizontal: -metrics.pagePadding },
  chips: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: metrics.pagePadding },
  summary: { ...typography.labelMedium, color: colors.onSurfaceVariant },
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
