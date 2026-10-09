import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  detailActionLabel,
  detailSignedOutLabel,
  locationLabel,
} from '../../../model/services/catalogFormat';
import { blockLabel } from '../../../model/services/securityFormat';
import { useFavorites } from '../../../factories/favorites';
import { useListingDetail } from '../../../factories/catalog';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
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

/**
 * No iPhone (Figma 03.01 a 03.03), voltar/compartilhar/favoritar flutuam sobre a capa, sem
 * barra de título — por isso o Stack esconde o cabeçalho padrão só nessa plataforma
 * (`(app)/_layout.tsx`). Android e Web continuam com a barra "Detalhes" de sempre.
 */
const isIOS = Platform.OS === 'ios';

/** Ícone de cada linha do cartão de fatos (Figma 03.01 a 03.03); o serviço só sabe o texto. */
function factIcon(label: string): AppIconName {
  if (label === 'Conservação') return 'conservation';
  if (label === 'Categoria') return 'category';
  return 'place';
}

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
  const { headline } = details;
  const userId = session.user?.id;
  const isOwner = Boolean(listing.ownerId && userId && listing.ownerId === userId);
  const isAvailable = listing.status === 'disponivel';
  const canNegotiate = !isOwner && isAvailable && session.status === 'signedIn';
  const canFavorite = !isOwner && session.status === 'signedIn';
  const noteColor =
    listing.modality === 'trade' ? badgeColors.trade.text : badgeColors.donation.text;
  const noteBackground =
    listing.modality === 'trade' ? badgeColors.tradeChip : badgeColors.donation.background;

  const place = locationLabel(listing);
  const shareListing = () => {
    Share.share({
      message: `${listing.title}, de ${listing.author} · ${headline.value} · ${headline.label} no IpêBook.`,
    }).catch(() => {});
  };
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
    <SafeAreaView
      style={styles.safe}
      edges={isIOS ? ['top', 'left', 'right', 'bottom'] : ['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gallery}>
          {isIOS && (
            <View style={styles.floatingHeader} pointerEvents="box-none">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={() => router.back()}
                hitSlop={8}
                style={({ pressed }) => [styles.circleButton, pressed && styles.circlePressed]}
              >
                <AppIcon name="back" size={20} color={colors.onSurface} />
              </Pressable>
              <View style={styles.floatingActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Compartilhar ${listing.title}`}
                  onPress={shareListing}
                  hitSlop={8}
                  style={({ pressed }) => [styles.circleButton, pressed && styles.circlePressed]}
                >
                  <AppIcon name="share" size={20} color={colors.onSurface} />
                </Pressable>
                {canFavorite && (
                  <FavoriteButton
                    favorite={favorites.isFavorite(listing.id)}
                    onToggle={() => favorites.toggle(listing.id)}
                    title={listing.title}
                    overlay
                  />
                )}
              </View>
            </View>
          )}
          <ListingCover listing={listing} variant="detail" />
        </View>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, styles.titleText]} accessibilityRole="header">
              {listing.title}
            </Text>
            {!isIOS && (
              <View style={styles.titleActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Compartilhar ${listing.title}`}
                  onPress={shareListing}
                  hitSlop={8}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
                >
                  <AppIcon name="share" size={20} color={colors.onSurfaceVariant} />
                </Pressable>
                {canFavorite && (
                  <FavoriteButton
                    favorite={favorites.isFavorite(listing.id)}
                    onToggle={() => favorites.toggle(listing.id)}
                    title={listing.title}
                  />
                )}
              </View>
            )}
          </View>
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
        {details.modalityNote && (
          <View
            style={[styles.modalityNote, { backgroundColor: noteBackground }]}
            accessible
            accessibilityLabel={`${details.modalityNote.title}. ${details.modalityNote.text}`}
          >
            <AppIcon name="info" size={18} color={noteColor} />
            <View style={styles.modalityNoteText}>
              <Text style={[styles.modalityNoteTitle, { color: noteColor }]}>
                {details.modalityNote.title}
              </Text>
              <Text style={[styles.modalityNoteBody, { color: noteColor }]}>
                {details.modalityNote.text}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.factsCard}>
          {details.facts.map((fact, index) => (
            <View key={fact.label} style={[styles.factRow, index > 0 && styles.factDivider]}>
              <AppIcon name={factIcon(fact.label)} size={18} color={colors.onSurfaceVariant} />
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue}>{fact.value}</Text>
            </View>
          ))}
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
              onPress={openReport}
              style={({ pressed }) => [styles.listItem, pressed && styles.listPressed]}
            >
              <AppIcon name="error" size={20} color={colors.onSurfaceVariant} />
              <View style={styles.listText}>
                <Text style={styles.listTitle}>Denunciar anúncio</Text>
                <Text style={styles.listBody}>Golpe, descrição falsa ou conteúdo ofensivo.</Text>
              </View>
              <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={blockLabel(listing.ownerFirstName)}
              onPress={() => setBlocking(true)}
              style={({ pressed }) => [styles.listItem, pressed && styles.listPressed]}
            >
              <AppIcon name="close" size={20} color={colors.onSurfaceVariant} />
              <View style={styles.listText}>
                <Text style={styles.listTitle}>{blockLabel(listing.ownerFirstName)}</Text>
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
        <View style={styles.note}>
          <AppIcon name="info" size={18} color={colors.onSurfaceVariant} />
          <Text style={styles.noteText}>{details.notes}</Text>
        </View>
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
    position: 'relative',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    backgroundColor: colors.container,
    marginBottom: spacing.xs,
  },
  // Voltar/compartilhar/favoritar flutuando sobre a capa, só no iPhone (Figma 03.01 a 03.03).
  floatingHeader: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingActions: { flexDirection: 'row', gap: spacing.xs },
  circleButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  circlePressed: { backgroundColor: colors.pressed },
  titleBlock: { gap: spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  titleText: { flex: 1 },
  // Compartilhar e favoritar ao lado do título no Android e na Web (sem capa flutuante).
  titleActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: { backgroundColor: colors.pressed },
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
  // Cartão da troca ("Aceita em troca") e da doação ("Doação para quem vai ler"); nada na venda.
  modalityNote: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.medium,
  },
  modalityNoteText: { flex: 1, gap: spacing.xxs },
  modalityNoteTitle: { ...typography.bodyLarge, fontWeight: '600' },
  modalityNoteBody: { ...typography.bodyMedium },
  // Cartão agrupado de conservação, categoria e retirada (Figma 03.01 a 03.03).
  factsCard: {
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
    overflow: 'hidden',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  factDivider: { borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  factLabel: { ...typography.bodyLarge, color: colors.onSurface, flex: 1 },
  factValue: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
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
  listBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  note: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
  noteText: { ...typography.bodyMedium, color: colors.onSurfaceVariant, flex: 1 },
  // Barra fixa da ação principal (Figma: 80 de altura sobre o container baixo).
  actionBar: {
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.containerLow,
  },
});
