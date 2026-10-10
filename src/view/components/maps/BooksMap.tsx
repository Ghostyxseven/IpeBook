import { StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { useBooksMapViewModel } from '../../../viewmodel/useBooksMapViewModel';
import { colors, spacing, typography } from '../../theme/nativeTheme';
import { BookCard } from '../catalog/BookCard';
import { Button } from '../ui/Button';
import { PublicMap } from './PublicMap';

export function BooksMap({ items, onOpen }: { items: Listing[]; onOpen: (id: string) => void }) {
  const vm = useBooksMapViewModel(items);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.body}>
        As capas indicam pontos públicos de encontro escolhidos por quem anunciou, não onde as
        pessoas moram ou estão.
      </Text>
      <PublicMap markers={vm.markers} onSelect={vm.select} />
      <View accessibilityLiveRegion="polite">
        <Text accessibilityRole="header" style={styles.title}>
          {vm.selectionName ?? 'Livros com ponto de encontro'}
        </Text>
        {vm.books.length === 0 ? (
          <Text style={styles.body}>
            Ainda não há livros com ponto público para estes filtros. Você pode voltar à lista.
          </Text>
        ) : null}
      </View>
      {vm.selected ? (
        <Button
          label="Mostrar todos os pontos carregados"
          variant="text"
          onPress={vm.clearSelection}
        />
      ) : null}
      {vm.visibleBooks.map((book) => (
        <View key={book.id} style={styles.wrapper}>
          <Text style={styles.body}>{book.meetingPoint?.name}</Text>
          <BookCard listing={book} onPress={() => onOpen(book.id)} />
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: { gap: spacing.md },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  title: { ...typography.titleMedium, color: colors.onSurface },
});
