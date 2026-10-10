import { useMemo, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { colors, metrics, spacing } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';
import { FormMessage } from '../ui/FormMessage';
import { BookCard } from './BookCard';
import { BookTile } from './BookTile';
import { useWebLayout } from '../../hooks/useWebLayout';
import { webLayout } from '../../theme/nativeTheme';

/** Lista de Book Cards com rolagem infinita, puxar para atualizar e rodapé de carregamento. */
export function CatalogList({
  items,
  header,
  empty,
  footer,
  refreshing,
  loadingMore,
  loadMoreError,
  onRefresh,
  onEndReached,
  onOpen,
  isFavorite,
  onToggleFavorite,
}: {
  items: Listing[];
  header: ReactElement;
  empty: ReactElement | null;
  /** Conteúdo depois do último item, como o "Limpar filtro" do Figma 26. */
  footer?: ReactElement | null;
  refreshing: boolean;
  loadingMore: boolean;
  loadMoreError?: string;
  onRefresh: () => void;
  onEndReached: () => void;
  onOpen: (id: string) => void;
  /** Sem isso, os cards não mostram o coração (Figma 37). */
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const { medium, large } = useWebLayout();
  const columns = large ? 4 : medium ? 2 : 1;
  const gridItems = useMemo(() => {
    if (columns === 1 || items.length === 0) return items;
    const missing = (columns - (items.length % columns)) % columns;
    return [...items, ...Array<null>(missing).fill(null)];
  }, [items, columns]);
  return (
    <FlatList
      key={columns}
      numColumns={columns}
      data={gridItems}
      keyExtractor={(item, index) => item?.id ?? `vazio-${index}`}
      renderItem={({ item }) => (
        <View style={columns > 1 ? styles.gridCell : undefined}>
          {item == null ? null : columns > 1 ? (
            <BookTile
              listing={item}
              onPress={() => onOpen(item.id)}
              favorite={isFavorite?.(item.id)}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.id) : undefined}
              wide
            />
          ) : (
            <BookCard
              listing={item}
              onPress={() => onOpen(item.id)}
              favorite={isFavorite?.(item.id)}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.id) : undefined}
            />
          )}
        </View>
      )}
      columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            color={colors.action}
            accessibilityLabel="Carregando mais livros"
            style={styles.footer}
          />
        ) : loadMoreError ? (
          <View style={styles.footer}>
            <FormMessage tone="error" message={loadMoreError} />
            <Button label="Carregar mais" variant="secondary" onPress={onEndReached} />
          </View>
        ) : (
          (footer ?? null)
        )
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />
      }
      contentContainerStyle={[styles.content, medium && styles.webContent]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: metrics.pagePadding,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  webContent: { maxWidth: webLayout.contentMaxWidth, gap: spacing.md },
  gridRow: { gap: spacing.md },
  gridCell: { flex: 1, minWidth: 0 },
  footer: { paddingVertical: spacing.lg, gap: spacing.xs },
});
