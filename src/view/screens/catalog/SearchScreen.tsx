import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Modality } from '../../../model/entities/Listing';
import { MIN_QUERY_LENGTH } from '../../../model/services/catalogFilters';
import { modalityLabels } from '../../../model/services/catalogFormat';
import { isCategory } from '../../../model/services/categories';
import { useCatalogSearch } from '../../../factories/catalog';
import { CatalogList } from '../../components/catalog/CatalogList';
import { ChipRow } from '../../components/catalog/ChipRow';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { colors, spacing, typography } from '../../theme/nativeTheme';

const modalities: Modality[] = ['sale', 'trade', 'donation'];

/** Buscar: texto, modalidade e categoria combináveis, seguindo o pattern Descobrir livro. */
export function SearchScreen() {
  const router = useRouter();
  const { categoria } = useLocalSearchParams<{ categoria?: string }>();
  const vm = useCatalogSearch(categoria && isCategory(categoria) ? categoria : null);
  const count = vm.activeFilterCount;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        Buscar livros
      </Text>
      <TextField
        label="Título ou autor"
        hint={`Digite pelo menos ${MIN_QUERY_LENGTH} letras.`}
        value={vm.query}
        onChangeText={vm.setQuery}
        placeholder="Ex.: Dom Casmurro"
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <ChipRow
        title="Modalidade"
        options={modalities}
        labelOf={(modality) => modalityLabels[modality]}
        isSelected={(modality) => vm.modalities.includes(modality)}
        onToggle={vm.toggleModality}
      />
      <ChipRow
        title="Categoria"
        options={vm.categories}
        isSelected={(item) => vm.category === item}
        onToggle={(item) => vm.setCategory(vm.category === item ? null : item)}
      />
      {vm.searching && (
        <View style={styles.summary}>
          <Text style={styles.summaryText} accessibilityLiveRegion="polite">
            {count === 0
              ? 'Nenhum filtro ativo'
              : count === 1
                ? '1 filtro ativo'
                : `${count} filtros ativos`}
          </Text>
          <Button label="Limpar tudo" variant="text" onPress={vm.clear} />
        </View>
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
      <EmptyState
        title="Nenhum livro encontrado"
        message="Confira a grafia ou tire alguns filtros para ver mais resultados."
        actionLabel="Limpar filtros"
        onAction={vm.clear}
      />
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
  safe: { flex: 1, backgroundColor: colors.background },
  header: { gap: spacing.md, paddingBottom: spacing.xs },
  title: { ...typography.title, color: colors.text },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryText: { ...typography.caption, color: colors.secondaryText },
});
