import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyListings } from '../../../factories/listings';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { MyListingCard } from '../../components/listings/MyListingCard';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Minha estante (spec 026, Figma 07): os próprios anúncios e o que fazer com eles. */
export function MyShelfScreen() {
  const router = useRouter();
  const vm = useMyListings();

  if (vm.status === 'loading') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <LoadingState message="Carregando seus anúncios…" />
      </SafeAreaView>
    );
  }

  if (vm.status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ErrorState
          message={vm.loadError ?? 'Não conseguimos carregar seus anúncios.'}
          onRetry={vm.reload}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Minha estante
        </Text>
        <Button label="Anunciar um livro" onPress={() => router.push('/anunciar')} />
        <FormMessage tone="error" message={vm.error} />
      </View>

      {vm.empty ? (
        <EmptyState
          title="Você ainda não anunciou nenhum livro"
          message="Comece pelo que já leu e não vai reler. Alguém por perto está procurando."
          actionLabel="Anunciar o primeiro"
          onAction={() => router.push('/anunciar')}
        />
      ) : (
        <FlatList
          data={vm.listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MyListingCard
              listing={item}
              busy={vm.pendingId === item.id}
              onEdit={() => router.push(`/anunciar/${item.id}`)}
              onArchive={() => vm.archive(item.id)}
              onRepublish={() => vm.republish(item.id)}
              onRemove={() => vm.remove(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: metrics.pagePadding, gap: spacing.sm },
  title: { ...typography.titleLarge, color: colors.text },
  list: { padding: metrics.pagePadding, paddingTop: 0, gap: spacing.sm },
});
