import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { colors, metrics, spacing } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';
import { FormMessage } from '../ui/FormMessage';
import { BookCard } from './BookCard';

/** Lista de Book Cards com rolagem infinita, puxar para atualizar e rodapé de carregamento. */
export function CatalogList({
  items,
  header,
  empty,
  refreshing,
  loadingMore,
  loadMoreError,
  onRefresh,
  onEndReached,
  onOpen,
}: {
  items: Listing[];
  header: ReactElement;
  empty: ReactElement | null;
  refreshing: boolean;
  loadingMore: boolean;
  loadMoreError?: string;
  onRefresh: () => void;
  onEndReached: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <BookCard listing={item} onPress={() => onOpen(item.id)} />}
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
        ) : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />
      }
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: metrics.pagePadding,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  footer: { paddingVertical: spacing.lg, gap: spacing.xs },
});
