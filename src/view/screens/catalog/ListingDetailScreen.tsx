import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { locationLabel } from '../../../model/services/catalogFormat';
import { useListingDetail } from '../../../factories/catalog';
import { AppIcon } from '../../components/AppIcon';
import { ListingCover } from '../../components/catalog/ListingCover';
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
  const listingId = String(id ?? '');

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

  const place = locationLabel(listing);
  const openSafety = () =>
    router.push({
      pathname: '/(app)/seguranca',
      params: {
        listingId: listing.id,
        userId: listing.ownerId ?? '',
        userName: details.owner ?? '',
      },
    });
  const primary = canNegotiate
    ? {
        label: 'Combinar encontro',
        onPress: () => router.push(`/livro/${listingId}/combinar`),
        hint: 'Abre o formulário para propor local, dia e horário.',
      }
    : isOwner
      ? { label: 'Ver solicitações', onPress: () => router.push('/negociacoes') }
      : session.status === 'signedOut' && isAvailable
        ? { label: 'Entrar para combinar encontro', onPress: () => router.replace('/entrar') }
        : null;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gallery}>
          <ListingCover listing={listing} variant="detail" />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title} accessibilityRole="header">
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
        <Text style={styles.meta}>{details.meta}</Text>
        {details.paragraphs.map((text) => (
          <Text key={text} style={styles.about}>
            {text}
          </Text>
        ))}
        {listing.ownerFirstName ? (
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
        ) : null}
        {!isOwner && session.status === 'signedIn' && listing.ownerId ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sua segurança: denunciar ou bloquear"
            onPress={openSafety}
            style={({ pressed }) => [styles.listItem, pressed && styles.listPressed]}
          >
            <AppIcon name="error" size={20} color={colors.onSurfaceVariant} />
            <View style={styles.listText}>
              <Text style={styles.listTitle}>Sua segurança</Text>
              <Text style={styles.listBody}>Denunciar ou bloquear quem anunciou.</Text>
            </View>
            <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
          </Pressable>
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
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    backgroundColor: colors.container,
    marginBottom: spacing.xs,
  },
  titleBlock: { gap: spacing.xxs },
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
  meta: { ...typography.labelLarge, color: colors.onSurfaceVariant },
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
