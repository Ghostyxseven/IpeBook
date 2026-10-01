import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogFeed } from '../../../factories/catalog';
import { useSessionContext } from '../../../viewmodel/useSession';
import { ChipRow } from '../../components/catalog/ChipRow';
import { CatalogList } from '../../components/catalog/CatalogList';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, spacing, typography } from '../../theme/nativeTheme';

/** Início: saudação, atalhos de busca e categoria e os anúncios mais recentes. */
export function HomeFeedScreen() {
  const router = useRouter();
  const session = useSessionContext();
  const vm = useCatalogFeed();
  const firstName = session.user?.name.split(' ')[0];
  const openListing = (id: string) => router.push({ pathname: '/livro/[id]', params: { id } });

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          {firstName ? `Olá, ${firstName}!` : 'Olá!'}
        </Text>
        <Button
          label="Sair"
          variant="text"
          onPress={session.signOut}
          loading={session.signingOut}
        />
      </View>
      <FormMessage tone="error" message={session.error} />
      <Button
        label="Buscar por título ou autor"
        variant="secondary"
        onPress={() => router.push('/buscar')}
      />
      <ChipRow
        title="Categorias"
        options={vm.categories}
        isSelected={() => false}
        onToggle={(categoria) => router.push({ pathname: '/buscar', params: { categoria } })}
      />
      <Text style={styles.section} accessibilityRole="header">
        Anunciados recentemente
      </Text>
      {vm.status === 'ready' && vm.error && <FormMessage tone="error" message={vm.error} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {vm.status === 'loading' ? (
        <LoadingState message="Carregando livros…" />
      ) : (
        <CatalogList
          items={vm.items}
          header={header}
          empty={
            vm.status === 'error' ? (
              <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
            ) : (
              <EmptyState
                title="Ainda não há livros anunciados"
                message="Quando alguém anunciar um livro para venda, troca ou doação, ele aparece aqui. Puxe a lista para atualizar."
              />
            )
          }
          refreshing={vm.refreshing}
          loadingMore={vm.loadingMore}
          loadMoreError={vm.loadMoreError}
          onRefresh={vm.refresh}
          onEndReached={vm.loadMore}
          onOpen={openListing}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { gap: spacing.md, paddingBottom: spacing.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { ...typography.title, color: colors.text, flexShrink: 1 },
  section: { ...typography.section, color: colors.text },
});
