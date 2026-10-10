import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useManageListing } from '../../../factories/listings';
import type { MyListing } from '../../../model/entities/Listing';
import { locationLabel, modalitySummary } from '../../../model/services/catalogFormat';
import { myStatusLabels } from '../../../model/services/listingFormat';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { ListingCover } from '../../components/catalog/ListingCover';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Gerenciar anúncio (spec 032): quadros 04.08 ativo, 04.10 pausado, 04.20
 * confirmar exclusão e 04.21 excluído.
 *
 * Os quatro são estados do mesmo anúncio, não quatro rotas: depois de excluir,
 * uma rota separada deixaria no histórico uma tela que recarregaria um anúncio
 * que já não existe.
 */
export function ManageListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useManageListing(String(id ?? ''));
  const [confirming, setConfirming] = useState(false);

  if (vm.status === 'loading') {
    return (
      <View style={styles.screen}>
        <LoadingState message="Carregando o anúncio…" />
      </View>
    );
  }

  // 04.21 · Anúncio excluído
  if (vm.status === 'removed') {
    return <Removed title={vm.listing?.title ?? 'O anúncio'} />;
  }

  if (vm.status === 'error' || !vm.listing) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        </View>
      </SafeAreaView>
    );
  }

  const { listing } = vm;

  // 04.20 · Excluir anúncio?
  if (confirming) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.brand}>
            Excluir este anúncio?
          </Text>
          <Text style={styles.body}>
            {`${listing.title} vai sair do catálogo. Esta ação não pode ser desfeita.`}
          </Text>
          <Text style={styles.caption}>
            As conversas sobre o livro continuam disponíveis no seu histórico.
          </Text>
          <FormMessage tone="error" message={vm.actionError} />
          <View style={styles.actions}>
            <Button
              label="Excluir anúncio"
              variant="danger"
              loading={vm.busy}
              onPress={vm.remove}
            />
            <Button
              label="Manter anúncio"
              variant="text"
              disabled={vm.busy}
              onPress={() => setConfirming(false)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const paused = listing.status === 'arquivado';
  // Reservado e concluído pertencem à negociação (ADR 0018): aqui só se olha.
  const owned = listing.status === 'disponivel' || paused;

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.brand}>
          {paused ? 'Um intervalo para seu livro.' : 'Seu livro, suas escolhas.'}
        </Text>
        <Text style={styles.body}>
          {paused
            ? 'Seu anúncio está pausado e pode voltar quando você quiser.'
            : 'Acompanhe e atualize esta publicação.'}
        </Text>

        <Preview listing={listing} />

        <View style={[styles.statusCard, paused ? styles.statusPaused : styles.statusActive]}>
          <Text style={styles.statusTitle}>{paused ? 'Fora do catálogo' : 'Anúncio ativo'}</Text>
          <Text style={styles.body}>
            {paused
              ? `${listing.title} não aparece nas buscas. As conversas anteriores continuam disponíveis.`
              : `${listing.title} está disponível ${modalitySummary(listing).toLocaleLowerCase('pt-BR')}${
                  listing.neighborhood ? ` em ${listing.neighborhood}` : ''
                }.`}
          </Text>
        </View>

        <FormMessage tone="error" message={vm.actionError} />

        <View style={styles.list}>
          <Row
            icon="edit"
            title="Editar anúncio"
            body={
              paused
                ? 'Prepare sua publicação antes de voltar.'
                : 'Atualize fotos, preço e descrição.'
            }
            disabled={vm.busy}
            onPress={() => router.push(`/anunciar/${listing.id}`)}
          />
          {!paused && owned ? (
            <Row
              icon="archive"
              title="Pausar anúncio"
              body="O livro deixa de aparecer no catálogo."
              disabled={vm.busy}
              onPress={vm.pause}
            />
          ) : null}
          {/* O quadro 04.08 traz esta ação, mas concluir é da negociação, não de
              quem anunciou (ADR 0018). A linha leva onde a conclusão acontece. */}
          <Row
            icon="checkCircle"
            title="Marcar como concluído"
            body="Pela negociação, em Conversas."
            disabled={vm.busy}
            onPress={() => router.push('/conversas')}
          />
        </View>
      </ScrollView>

      <ActionBar>
        {paused ? (
          <>
            <Button label="Retomar anúncio" loading={vm.busy} onPress={vm.resume} />
            <Button
              label="Voltar à estante"
              variant="secondary"
              disabled={vm.busy}
              onPress={() => router.replace('/estante')}
            />
          </>
        ) : (
          <Button
            label="Excluir anúncio"
            variant="danger"
            disabled={vm.busy || !owned}
            onPress={() => setConfirming(true)}
          />
        )}
      </ActionBar>
    </SafeAreaView>
  );
}

/** A prévia do anúncio dos quadros 04.08 e 04.10. */
function Preview({ listing }: { listing: MyListing }) {
  const place = locationLabel(listing);
  const value = `${modalitySummary(listing)}${
    listing.status === 'disponivel' ? '' : ` · ${myStatusLabels[listing.status]}`
  }`;
  return (
    <View style={styles.preview} accessible accessibilityLabel={`${listing.title}. ${value}.`}>
      <ListingCover listing={listing} variant="shelf" />
      <View style={styles.previewText}>
        <Text style={styles.previewTitle} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.body} numberOfLines={1}>
          {listing.author}
        </Text>
        <Text style={styles.previewValue}>{value}</Text>
        {place ? <Text style={styles.body}>{place}</Text> : null}
      </View>
    </View>
  );
}

/** 04.21 · Anúncio excluído. */
function Removed({ title }: { title: string }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.brand} accessibilityLiveRegion="polite">
          Anúncio excluído.
        </Text>
        <Text style={styles.body}>
          {`${title} deixou de aparecer no catálogo e nos seus anúncios ativos.`}
        </Text>
        <Text style={styles.caption}>Você pode publicar outro livro quando quiser.</Text>
        <View style={styles.actions}>
          <Button
            label="Ver minha estante"
            onPress={() => router.replace({ pathname: '/estante', params: { removido: title } })}
          />
          <Button
            label="Anunciar outro livro"
            variant="text"
            onPress={() => router.replace('/anunciar')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  title,
  body,
  onPress,
  disabled,
}: {
  icon: AppIconName;
  title: string;
  body: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={body}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <AppIcon name={icon} size={20} color={colors.onSurfaceVariant} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.readingMaxWidth,
    alignSelf: 'center',
  },
  brand: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  caption: { ...typography.caption, color: colors.onSurfaceVariant },
  preview: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.container,
  },
  previewText: { flex: 1, gap: spacing.xxs },
  previewTitle: { ...typography.titleMedium, color: colors.onSurface },
  previewValue: { ...typography.labelLarge, color: colors.action },
  statusCard: { gap: spacing.xxs, padding: spacing.md, borderRadius: radius.medium },
  statusActive: { backgroundColor: colors.selected },
  statusPaused: { backgroundColor: colors.containerLow },
  statusTitle: { ...typography.titleMedium, color: colors.onSurface },
  list: { gap: spacing.xxs },
  row: {
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.small,
  },
  rowPressed: { backgroundColor: colors.pressed },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodyLarge, color: colors.onSurface },
  actions: { gap: spacing.xs, paddingTop: spacing.xs },
});
