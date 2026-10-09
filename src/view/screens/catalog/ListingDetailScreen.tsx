import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  detailActionLabel,
  detailSignedOutLabel,
  locationLabel,
} from '../../../model/services/catalogFormat';
import { blockLabel } from '../../../model/services/securityFormat';
import { useFavorites } from '../../../factories/favorites';
import { useListingDetail } from '../../../factories/catalog';
import { AppIcon } from '../../components/AppIcon';
import { FavoriteButton } from '../../components/catalog/FavoriteButton';
import { ListingCover } from '../../components/catalog/ListingCover';
import { BlockUserDialog } from '../../components/security/BlockUserDialog';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { useSessionContext } from '../../../viewmodel/useSession';
import { badgeColors, colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Detalhe do livro (Figma 03.01 a 03.03): tudo o que é preciso para decidir antes de agir. */
export function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useListingDetail(String(id ?? ''));
  const session = useSessionContext();
  const favorites = useFavorites();
  const listingId = String(id ?? '');
  const [blocking, setBlocking] = useState(false);

  if (vm.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Carregando livro…" />
      </View>
    );
  }

  if (vm.status !== 'ready' || !vm.listing || !vm.details) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          {vm.status === 'notFound' ? (
            <EmptyState
              title="Livro indisponível"
              message={vm.error ?? ''}
              actionLabel="Explorar outros livros"
              onAction={() => router.replace('/explorar')}
            />
          ) : (
            <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { listing, details } = vm;
  const { headline, card } = details;
  const share = () =>
    Share.share({ message: `"${listing.title}" está no IpêBook, em Piripiri.` }).catch(() => {});
  const userId = session.user?.id;
  const isOwner = Boolean(listing.ownerId && userId && listing.ownerId === userId);
  const isAvailable = listing.status === 'disponivel';
  const canNegotiate = !isOwner && isAvailable && session.status === 'signedIn';

  const place = locationLabel(listing);
  const openReport = () =>
    router.push({
      pathname: '/(app)/seguranca/report',
      params: {
        listingId: listing.id,
        userId: listing.ownerId ?? '',
        userName: listing.ownerFirstName ?? '',
      },
    });
  const primary = canNegotiate
    ? {
        label: detailActionLabel(listing.modality),
        onPress: () => router.push(`/livro/${listingId}/combinar`),
        hint: 'Abre o formulário para propor local, dia e horário.',
      }
    : isOwner
      ? { label: 'Ver solicitações', onPress: () => router.push('/conversas') }
      : session.status === 'signedOut' && isAvailable
        ? {
            label: detailSignedOutLabel(listing.modality),
            onPress: () => router.replace('/entrar'),
          }
        : null;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <Stack.Screen
        options={{
          // Figma 03.01: compartilhar e favoritar no próprio cabeçalho, junto do voltar.
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Compartilhar ${listing.title}`}
                onPress={share}
                hitSlop={8}
                style={({ pressed }) => [styles.headerButton, pressed && styles.actionPressed]}
              >
                <AppIcon name="share" size={22} color={colors.onSurfaceVariant} />
              </Pressable>
              {!isOwner && session.status === 'signedIn' && (
                <FavoriteButton
                  favorite={favorites.isFavorite(listing.id)}
                  onToggle={() => favorites.toggle(listing.id)}
                  title={listing.title}
                />
              )}
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gallery}>
          <ListingCover listing={listing} variant="detail" />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, styles.titleText]} accessibilityRole="header">
            {listing.title}
          </Text>
          <Text style={styles.author}>{listing.author}</Text>
        </View>
        <View
          style={styles.headline}
          accessible
          accessibilityLabel={`${headline.value}, ${headline.label.toLocaleLowerCase('pt-BR')}`}
        >
          <Text style={styles.value}>{headline.value}</Text>
          <View style={[styles.tag, { backgroundColor: badgeColors[listing.modality].background }]}>
            <Text style={[styles.tagText, { color: badgeColors[listing.modality].text }]}>
              {headline.label}
            </Text>
          </View>
        </View>
        {listing.status === 'reservado' && (
          <View style={styles.reserved}>
            <StatusBadge variant="reserved" />
            <Text style={styles.reservedText}>
              Este livro está reservado para outra pessoa no momento.
            </Text>
          </View>
        )}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Conservação</Text>
            <Text style={styles.cardValue}>{card.condition}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Categoria</Text>
            <Text style={styles.cardValue}>{card.category}</Text>
          </View>
          {card.location && (
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Retirada</Text>
              <Text style={styles.cardValue}>{card.location}</Text>
            </View>
          )}
        </View>
        {details.paragraphs.map((text) => (
          <Text key={text} style={styles.about}>
            {text}
          </Text>
        ))}
        {listing.ownerFirstName ? (
          // Spec 031: o nome de quem anunciou abre o perfil daquela pessoa. Sem
          // `ownerId` não há perfil para abrir — fica a informação, como antes.
          listing.ownerId && !isOwner ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver o perfil de ${listing.ownerFirstName}`}
              accessibilityHint="Mostra avaliações e histórico na comunidade."
              onPress={() =>
                router.push({
                  pathname: '/pessoa/[id]',
                  params: { id: listing.ownerId as string, livro: listing.id },
                })
              }
              style={({ pressed }) => [styles.listItem, pressed && styles.listPressed]}
            >
              <AppIcon name="person" size={20} color={colors.onSurfaceVariant} />
              <View style={styles.listText}>
                <Text style={styles.listTitle}>{listing.ownerFirstName}</Text>
                {place && <Text style={styles.listBody}>{place}</Text>}
              </View>
              <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
            </Pressable>
          ) : (
            <View
              style={styles.listItem}
              accessible
              accessibilityLabel={`Anunciado por ${details.owner}`}
            >
              <AppIcon name="person" size={20} color={colors.onSurfaceVariant} />
              <View style={styles.listText}>
                <Text style={styles.listTitle}>{listing.ownerFirstName}</Text>
                {place && <Text style={styles.listBody}>{place}</Text>}
              </View>
            </View>
          )
        ) : null}
        {!isOwner && session.status === 'signedIn' && listing.ownerId ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Denunciar anúncio"
              accessibilityHint="Golpe, descrição falsa ou conteúdo ofensivo."
              onPress={openReport}
              style={({ pressed }) => [styles.listItem, pressed && styles.listPressed]}
            >
              <AppIcon name="error" size={20} color={colors.error} />
              <View style={styles.listText}>
                <Text style={[styles.listTitle, styles.dangerText]}>Denunciar anúncio</Text>
                <Text style={styles.listBody}>Golpe, descrição falsa ou conteúdo ofensivo.</Text>
              </View>
              <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={blockLabel(listing.ownerFirstName)}
              accessibilityHint="Os anúncios dessa pessoa somem para você."
              onPress={() => setBlocking(true)}
              style={({ pressed }) => [styles.listItem, pressed && styles.listPressed]}
            >
              <AppIcon name="close" size={20} color={colors.error} />
              <View style={styles.listText}>
                <Text style={[styles.listTitle, styles.dangerText]}>
                  {blockLabel(listing.ownerFirstName)}
                </Text>
                <Text style={styles.listBody}>Os anúncios dessa pessoa somem para você.</Text>
              </View>
            </Pressable>
            <BlockUserDialog
              visible={blocking}
              userId={listing.ownerId}
              firstName={listing.ownerFirstName}
              onCancel={() => setBlocking(false)}
              onBlocked={() => {
                setBlocking(false);
                router.back();
              }}
            />
          </>
        ) : null}
        <View style={styles.separator} />
        <Text style={styles.noteText}>{details.notes}</Text>
      </ScrollView>
      {primary && (
        <View style={styles.actionBar}>
          <Button
            label={primary.label}
            onPress={primary.onPress}
            accessibilityHint={primary.hint}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  // Figma 03.01: capa centrada sobre o container, com raio 16.
  gallery: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    backgroundColor: colors.container,
    marginBottom: spacing.xs,
  },
  // Figma 03.01: compartilhar e favoritar no cabeçalho, ao lado de "Detalhes".
  // Mesmo alvo de 48 do FavoriteButton, para os dois ícones terem o mesmo peso.
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: { backgroundColor: colors.pressed },
  titleBlock: { gap: spacing.xxs },
  titleText: { flex: 1 },
  title: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
  },
  author: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  headline: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  value: { fontSize: 28, lineHeight: 36, fontWeight: '500', color: colors.onSurface },
  tag: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: radius.small },
  tagText: { ...typography.labelLarge },
  reserved: { gap: spacing.xxs },
  reservedText: { ...typography.bodyMedium, color: colors.onSurface },
  // Cartão de três linhas (Figma 03.01): conservação, categoria e retirada.
  card: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.container,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  cardLabel: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  cardValue: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '500' },
  about: { ...typography.bodyLarge, color: colors.onSurface },
  listItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: -spacing.md,
    borderRadius: radius.small,
  },
  listPressed: { backgroundColor: colors.pressed },
  listText: { flex: 1 },
  listTitle: { ...typography.bodyLarge, color: colors.onSurface },
  // Mesmo tom "danger" do Sair em ProfileScreen.tsx: denunciar e bloquear também
  // são ações que afetam a relação com a outra pessoa, não navegação neutra.
  dangerText: { color: colors.error },
  listBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  // Separa a nota de publicação das linhas clicáveis acima (perfil, denunciar,
  // bloquear): sem o traço, as quatro linhas pareciam uma lista só, mas só as
  // três primeiras respondem ao toque.
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.outlineVariant },
  noteText: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  // Barra fixa da ação principal (Figma: 80 de altura sobre o container baixo).
  actionBar: {
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.containerLow,
  },
});
