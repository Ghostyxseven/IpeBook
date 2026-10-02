import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupNotifications } from '../../../model/services/notificationFormat';
import { useNotifications } from '../../../factories/notifications';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Notificações (Figma 07.04 e 07.13): avisos agrupados por Hoje e Esta semana; tocar abre o anúncio e marca como lido. */
export function NotificationsScreen() {
  const router = useRouter();
  const vm = useNotifications();
  const { refresh } = vm;

  // Ao voltar para a tela (por exemplo depois de abrir um anúncio) a lista se atualiza.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) firstFocus.current = false;
      else void refresh();
    }, [refresh]),
  );

  if (vm.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Carregando avisos…" />
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

  const open = async (id: string) => {
    const listingId = await vm.markRead(id);
    if (listingId) router.push({ pathname: '/livro/[id]', params: { id: listingId } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <SectionList
        sections={groupNotifications(vm.items)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor={colors.action}
          />
        }
        onEndReached={vm.loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            {vm.unreadInList > 0 && (
              <Button
                label="Marcar todas como lidas"
                variant="text"
                loading={vm.markingAll}
                onPress={vm.markAllRead}
              />
            )}
            <FormMessage tone="error" message={vm.actionError ?? vm.error} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.section} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum aviso por enquanto"
            message="Quando alguém pedir um livro seu ou responder a um pedido, você vê aqui."
          />
        }
        ListFooterComponent={
          vm.loadingMore ? (
            <ActivityIndicator
              color={colors.action}
              accessibilityLabel="Carregando mais avisos"
              style={styles.footer}
            />
          ) : vm.loadMoreError ? (
            <View style={styles.footer}>
              <FormMessage tone="error" message={vm.loadMoreError} />
              <Button label="Tentar de novo" variant="secondary" onPress={vm.loadMore} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => void open(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    paddingHorizontal: metrics.pagePadding - spacing.md,
    paddingBottom: metrics.pagePadding,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  header: { gap: spacing.sm, alignItems: 'flex-end' },
  // Rótulo de grupo (Figma 07.04): "Hoje" e "Esta semana" alinhados à margem da página.
  section: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  footer: { paddingVertical: spacing.md, gap: spacing.sm },
});
