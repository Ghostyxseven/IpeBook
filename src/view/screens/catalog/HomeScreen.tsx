import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Modality } from '../../../model/entities/Listing';
import { modalityLabels } from '../../../model/services/catalogFormat';
import sublinhadoMarca from '../../../../assets/catalog/sublinhado-marca.svg';
import { useCatalogFeed } from '../../../factories/catalog';
import { useFavorites } from '../../../factories/favorites';
import { useUnreadCount } from '../../../factories/notifications';
import { useSessionContext } from '../../../viewmodel/useSession';
import { useWebLayout } from '../../hooks/useWebLayout';
import { AppIcon } from '../../components/AppIcon';
import { BookTile } from '../../components/catalog/BookTile';
import { ModalityChip } from '../../components/catalog/ModalityChip';
import { NeighborhoodChip } from '../../components/catalog/NeighborhoodChip';
import { SearchBarButton } from '../../components/catalog/SearchBar';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography, webLayout } from '../../theme/nativeTheme';
import { exploreHref } from './routeParams';

const modalities: Modality[] = ['sale', 'trade', 'donation'];

const emptyMessages: Record<Modality | 'all', string> = {
  all: 'Quando alguém anunciar um livro para venda, troca ou doação, ele aparece aqui.',
  sale: 'Ainda não há livros à venda. Veja as outras modalidades.',
  trade: 'Ainda não há livros para troca. Veja as outras modalidades.',
  donation: 'Ainda não há livros para doação. Veja as outras modalidades.',
};

const isIOS = Platform.OS === 'ios';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/**
 * Início (Figma 02.01, iOS 83:834 e Android 9:525): sino de avisos, título da marca,
 * busca, modalidades, carrossel dos livros mais recentes e atalho para doações.
 */
export function HomeScreen() {
  const { medium, large } = useWebLayout();
  const router = useRouter();
  const session = useSessionContext();
  const vm = useCatalogFeed(session.user?.name);
  const favorites = useFavorites();
  const unread = useUnreadCount();
  const refreshUnread = unread.refresh;
  const refreshFeed = vm.refresh;
  // Puxar para atualizar recarrega os livros e o contador de avisos do sino.
  const refreshAll = useCallback(
    () => Promise.all([refreshFeed(), refreshUnread()]).then(() => undefined),
    [refreshFeed, refreshUnread],
  );

  // Ao voltar de Notificações ou de um anúncio, o número do sino se atualiza.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) firstFocus.current = false;
      else void refreshUnread();
    }, [refreshUnread]),
  );

  const previewTiles = vm.preview.map((listing) => (
    <BookTile
      key={listing.id}
      listing={listing}
      onPress={() => router.push({ pathname: '/livro/[id]', params: { id: listing.id } })}
      favorite={favorites.isFavorite(listing.id)}
      onToggleFavorite={() => favorites.toggle(listing.id)}
      wide={large}
    />
  ));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.content, medium && styles.webContent]}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={refreshAll}
            tintColor={colors.action}
          />
        }
      >
        <View style={styles.topBar}>
          <NeighborhoodChip />
          <NotificationBell
            badgeText={unread.badgeText}
            accessibilityLabel={unread.accessibilityLabel}
            onPress={() => router.push('/notificacoes')}
          />
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline} accessibilityRole="header">
            {'Encontre sua\npróxima história.'}
          </Text>
          <Image
            source={sublinhadoMarca}
            style={styles.underline}
            contentFit="contain"
            accessible={false}
          />
          <Text style={styles.subtitle}>
            Compre, troque ou receba livros de quem mora perto de você.
          </Text>
        </View>

        <SearchBarButton onPress={() => router.push(exploreHref(vm.modality))} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.chips}
          accessibilityLabel="Modalidades"
        >
          <ModalityChip
            modality="all"
            label="Todos"
            selected={vm.modality === null}
            onPress={vm.showAll}
          />
          {modalities.map((modality) => (
            <ModalityChip
              key={modality}
              modality={modality}
              label={modalityLabels[modality]}
              selected={vm.modality === modality}
              onPress={() => vm.toggleModality(modality)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.section} accessibilityRole="header">
            Recém-chegados
          </Text>
          {vm.hasMoreThanPreview && (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Ver todos os livros"
              onPress={() => router.push(exploreHref(vm.modality))}
              style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                styles.link,
                pressed && styles.linkPressed,
                focused && focusRing,
              ]}
            >
              <Text style={styles.linkText}>Ver todos</Text>
            </Pressable>
          )}
        </View>
        {vm.status === 'ready' && vm.error && <FormMessage tone="error" message={vm.error} />}

        {vm.status === 'loading' ? (
          <ActivityIndicator
            color={colors.action}
            size="large"
            accessibilityLabel="Carregando livros"
            style={styles.loading}
          />
        ) : vm.status === 'error' ? (
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        ) : vm.preview.length === 0 ? (
          <EmptyState
            title="Ainda não há livros anunciados"
            message={emptyMessages[vm.modality ?? 'all']}
          />
        ) : large ? (
          <View
            style={[styles.carousel, styles.desktopCarousel]}
            accessibilityLabel="Livros recém-chegados"
          >
            {previewTiles}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.carousel}
            accessibilityLabel="Livros recém-chegados"
          >
            {previewTiles}
          </ScrollView>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Doações: livros gratuitos para quem quiser"
          onPress={() => router.push(exploreHref('donation'))}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.donations,
            pressed && styles.donationsPressed,
            focused && focusRing,
          ]}
        >
          <AppIcon name="bookmark" color={colors.onSurfaceVariant} />
          <View style={styles.donationsText}>
            <Text style={styles.donationsTitle}>Doações</Text>
            <Text style={styles.donationsBody}>Livros gratuitos para quem quiser.</Text>
          </View>
          <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  webContent: { maxWidth: webLayout.contentMaxWidth },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  hero: { gap: spacing.xs },
  // Título da marca em serifa (Figma: Source Serif 4 Bold, 30/36 no Android e 36/41 no iOS).
  headline: {
    ...typography.brandHeadline,
    ...(isIOS ? { fontSize: 36, lineHeight: 41 } : null),
    color: colors.onSurface,
  },
  // Sublinhado âmbar sob "próxima história." (Figma iOS 83:834).
  underline: { width: 260, height: 14, marginTop: -spacing.xs },
  subtitle: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  // Os carrosséis encostam na borda da tela e o conteúdo começa alinhado à página.
  bleed: { marginHorizontal: -metrics.pagePadding },
  chips: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: metrics.pagePadding },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: metrics.touchTarget,
  },
  // Figma 02.01: título de seção 22/28 regular (Title Large do Material 3; ver divergências).
  section: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
    flexShrink: 1,
  },
  link: {
    minHeight: metrics.touchTarget,
    minWidth: metrics.touchTarget,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkPressed: { backgroundColor: colors.pressed },
  linkText: { ...typography.labelLarge, color: colors.action },
  loading: { paddingVertical: spacing.xl },
  carousel: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: metrics.pagePadding,
    // Espaço para a sombra dos cards não ser cortada.
    paddingVertical: spacing.xxs,
  },
  desktopCarousel: { marginHorizontal: 0, paddingHorizontal: 0, gap: spacing.lg },
  // Item de lista do Material 3 (Figma 02.01): ícone, duas linhas e seta.
  donations: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.small,
  },
  donationsPressed: { backgroundColor: colors.pressed },
  donationsText: { flex: 1 },
  donationsTitle: { ...typography.bodyLarge, color: colors.onSurface },
  donationsBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});
