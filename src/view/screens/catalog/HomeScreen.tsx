import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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
import detalheIpe from '../../../../assets/catalog/detalhe-amarelo-ipe.svg';
import { useCatalogFeed } from '../../../factories/catalog';
import { useSessionContext } from '../../../viewmodel/useSession';
import { AppIcon } from '../../components/AppIcon';
import { BookTile } from '../../components/catalog/BookTile';
import { ModalityChip } from '../../components/catalog/ModalityChip';
import { SearchBarButton } from '../../components/catalog/SearchBar';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { exploreHref } from './routeParams';

const modalities: Modality[] = ['sale', 'trade', 'donation'];

const emptyMessages: Record<Modality | 'all', string> = {
  all: 'Quando alguém anunciar um livro para venda, troca ou doação, ele aparece aqui.',
  sale: 'Ainda não há livros à venda. Veja as outras modalidades.',
  trade: 'Ainda não há livros para troca. Veja as outras modalidades.',
  donation: 'Ainda não há livros para doação. Veja as outras modalidades.',
};

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/** Início (Figma 02 / Descobrir): busca, modalidades, livros recentes e atalho de doação. */
export function HomeScreen() {
  const router = useRouter();
  const session = useSessionContext();
  const vm = useCatalogFeed(session.user?.name);

  const pairs: (typeof vm.preview)[] = [];
  for (let i = 0; i < vm.preview.length; i += 2) pairs.push(vm.preview.slice(i, i + 2));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor={colors.action}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand} accessibilityRole="header">
              IpêBook
            </Text>
            <Text style={styles.greeting}>{vm.greeting}</Text>
          </View>
          {/* Temporário: sair fica aqui até a feature de Perfil existir. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair"
            accessibilityState={{ busy: session.signingOut, disabled: session.signingOut }}
            disabled={session.signingOut}
            onPress={session.signOut}
            style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
              focused && focusRing,
            ]}
          >
            {session.signingOut ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <AppIcon name="logout" />
            )}
          </Pressable>
        </View>
        <FormMessage tone="error" message={session.error} />

        <SearchBarButton onPress={() => router.push(exploreHref(vm.modality))} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          accessibilityLabel="Modalidades"
        >
          <ModalityChip
            modality="all"
            label="Todos"
            selected={vm.modality === null}
            showCheck={false}
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
            Livros recentes
          </Text>
          {vm.hasMoreThanPreview && (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Ver todos os livros"
              onPress={() => router.push(exploreHref(vm.modality))}
              style={({ focused }: { pressed: boolean; focused?: boolean }) => [
                styles.link,
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
        ) : (
          <View style={styles.grid}>
            {pairs.map((pair) => (
              <View key={pair[0].id} style={styles.row}>
                {pair.map((listing) => (
                  <BookTile
                    key={listing.id}
                    listing={listing}
                    onPress={() =>
                      router.push({ pathname: '/livro/[id]', params: { id: listing.id } })
                    }
                  />
                ))}
                {pair.length === 1 && <View style={styles.spacer} />}
              </View>
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explorar livros para doação"
          onPress={() => router.push(exploreHref('donation'))}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.invite,
            pressed && styles.invitePressed,
            focused && focusRing,
          ]}
        >
          <Image source={detalheIpe} style={styles.inviteDot} contentFit="contain" />
          <Text style={styles.inviteText}>Explorar livros para doação</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    paddingTop: spacing.md,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerText: { gap: spacing.xxs, flexShrink: 1 },
  brand: { ...typography.titleLarge, color: colors.text },
  greeting: { ...typography.labelMedium, color: colors.secondaryText },
  iconButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: { backgroundColor: colors.pressed },
  chips: { flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: metrics.touchTarget,
  },
  section: { ...typography.titleLarge, color: colors.text, flexShrink: 1 },
  link: { minHeight: metrics.touchTarget, minWidth: metrics.touchTarget, justifyContent: 'center' },
  linkText: { ...typography.labelMedium, color: colors.text },
  loading: { paddingVertical: spacing.xl },
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  spacer: { flex: 1 },
  invite: {
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: metrics.fieldRadius,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  invitePressed: { backgroundColor: colors.pressed },
  inviteDot: { width: 20, height: 20 },
  inviteText: { ...typography.bodyMedium, fontWeight: '500', color: colors.text, flex: 1 },
});
