import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookRequestList } from '../../../factories/bookRequest';
import { useMyListings } from '../../../factories/listings';
import { requestListLabel } from '../../../model/services/bookRequestFormat';
import { modalityLabels } from '../../../model/services/catalogFormat';
import {
  closedProposalsLabel,
  remainingLabel,
  shelfSections,
  shelfSupportingText,
} from '../../../model/services/listingFormat';
import { AppIcon } from '../../components/AppIcon';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ShelfBookRow } from '../../components/shelf/ShelfBookRow';
import { ShelfTabs, type ShelfTab } from '../../components/shelf/ShelfTabs';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Cabeçalho de marca de cada aba (Figma 05.03 e 05.04); a aba Anúncios não tem. */
const intros: Partial<Record<ShelfTab, { title: string; text: string }>> = {
  propostas: {
    title: 'Sua estante em movimento.',
    text: 'Acompanhe as propostas dos seus livros.',
  },
  concluidos: {
    title: 'Livros que seguem viagem.',
    text: 'Seu histórico de vendas, trocas e doações.',
  },
};

/** Minha estante (Figma Android 05.01 a 05.06): anúncios, propostas recebidas e concluídos. */
export function MyShelfScreen() {
  const router = useRouter();
  const vm = useMyListings();
  const requests = useBookRequestList();
  const [tab, setTab] = useState<ShelfTab>('anuncios');
  // 05.07: a estante logo depois de uma exclusão. O título vem pela rota, de
  // quem excluiu — o anúncio já não existe para ser consultado.
  const { removido } = useLocalSearchParams<{ removido?: string }>();
  const [removedNotice, setRemovedNotice] = useState<string | null>(
    removido ? String(removido) : null,
  );

  // Ao voltar de uma edição ou de uma negociação, a estante mostra a situação nova.
  // As funções de recarregar mudam a cada render; a ref evita reexecutar o efeito sem foco novo.
  const refresh = useRef(() => {});
  refresh.current = () => {
    vm.reload();
    void requests.retry();
  };
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) firstFocus.current = false;
      else refresh.current();
    }, []),
  );

  const { active, done } = useMemo(() => shelfSections(vm.listings), [vm.listings]);
  // 05.08 · Proposta encerrada: as recusadas não entram no fluxo principal, mas
  // quem anunciou precisa saber que elas não reservam mais o livro.
  const closed = useMemo(
    () => requests.items.filter((item) => item.asOwner && item.request.status === 'rejected'),
    [requests.items],
  );
  const proposals = useMemo(
    () =>
      requests.items.filter(
        (item) =>
          item.asOwner && (item.request.status === 'pending' || item.request.status === 'accepted'),
      ),
    [requests.items],
  );
  const now = new Date();

  const announce = () => router.push('/anunciar');
  const appBar = (
    <Text accessibilityRole="header" style={styles.appBar}>
      Minha estante
    </Text>
  );

  if (vm.status === 'loading') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        {appBar}
        <LoadingState message="Carregando sua estante…" />
      </SafeAreaView>
    );
  }

  if (vm.status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        {appBar}
        <ErrorState
          message={vm.loadError ?? 'Não conseguimos carregar seus anúncios.'}
          onRetry={vm.reload}
        />
      </SafeAreaView>
    );
  }

  // Figma 05.02: estante sem nenhum livro.
  if (vm.empty) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        {appBar}
        <View style={styles.emptyShelf}>
          <View style={styles.emptyIcon}>
            <AppIcon name="bookmark" size={32} color={colors.onSurface} />
          </View>
          <Text style={styles.emptyTitle} accessibilityRole="header">
            Sua estante começa com um livro
          </Text>
          <Text style={styles.emptyText}>
            Anuncie um livro para vender, trocar ou doar na sua região.
          </Text>
          <View style={styles.emptyActions}>
            <Button label="Anunciar livro" onPress={announce} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { key: 'anuncios' as const, label: `Anúncios (${active.length})` },
    {
      key: 'propostas' as const,
      label: proposals.length ? `Propostas (${proposals.length})` : 'Propostas',
    },
    { key: 'concluidos' as const, label: 'Concluídos' },
  ];
  const intro = intros[tab];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {appBar}
      <ScrollView contentContainerStyle={styles.content}>
        {intro ? (
          <View style={styles.intro}>
            <Text style={styles.introTitle} accessibilityRole="header">
              {intro.title}
            </Text>
            <Text style={styles.introText}>{intro.text}</Text>
          </View>
        ) : null}
        <ShelfTabs tabs={tabs} selected={tab} onSelect={setTab} />
        <FormMessage tone="error" message={vm.error} />

        {tab === 'anuncios' ? (
          active.length ? (
            <>
              {removedNotice ? (
                <View style={styles.notice} accessibilityLiveRegion="polite">
                  <Text accessibilityRole="header" style={styles.noticeTitle}>
                    Seus livros continuam a circular.
                  </Text>
                  <Text style={styles.introText}>
                    {`${removedNotice} foi removido dos anúncios ativos.`}
                  </Text>
                  <Text style={styles.footnote}>{remainingLabel(active.length)}</Text>
                  <Button label="Entendi" variant="text" onPress={() => setRemovedNotice(null)} />
                </View>
              ) : null}
              {active.map((listing) => (
                <ShelfBookRow
                  key={listing.id}
                  listing={listing}
                  supporting={shelfSupportingText(listing, now)}
                  hint="Abre o gerenciamento deste anúncio"
                  disabled={vm.pendingId === listing.id}
                  onPress={() =>
                    router.push({ pathname: '/anuncio/[id]', params: { id: listing.id } })
                  }
                />
              ))}
              <Text style={styles.footnote}>Toque em um livro para editar, pausar ou excluir.</Text>
              <DraftsEntry onPress={() => router.push('/anunciar/rascunhos')} />
            </>
          ) : (
            <>
              <TabEmpty
                title="Nenhum anúncio ativo"
                text="Os livros que você anunciar aparecem aqui."
                primary={{ label: 'Anunciar um livro', onPress: announce }}
              />
              <DraftsEntry onPress={() => router.push('/anunciar/rascunhos')} />
            </>
          )
        ) : null}

        {tab === 'propostas' ? (
          requests.status === 'loading' ? (
            <LoadingState message="Carregando propostas…" />
          ) : requests.status === 'error' ? (
            <ErrorState message={requests.error ?? ''} onRetry={requests.retry} />
          ) : proposals.length ? (
            <>
              {proposals.map(({ request, listing }) => (
                <ShelfBookRow
                  key={request.id}
                  listing={
                    listing ?? {
                      id: request.listingId,
                      title: 'Livro indisponível',
                      author: '',
                      coverUrl: null,
                    }
                  }
                  supporting={[
                    requestListLabel(request, { asOwner: true }),
                    listing ? modalityLabels[listing.modality] : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  hint="Abre a negociação"
                  onPress={() => router.push(`/negociacoes/${request.id}`)}
                />
              ))}
              <Note
                title="Tudo pela conversa"
                text="Confira a proposta e combine os detalhes antes de reservar seu livro."
              />
              <ClosedProposals items={closed} onOpen={() => setTab('anuncios')} />
            </>
          ) : (
            <TabEmpty
              title="Nenhuma proposta ainda"
              text="Complete seus anúncios para facilitar a próxima venda, troca ou doação."
              secondary={{ label: 'Ver meus anúncios', onPress: () => setTab('anuncios') }}
              primary={{ label: 'Anunciar um livro', onPress: announce }}
            />
          )
        ) : null}

        {tab === 'concluidos' ? (
          done.length ? (
            <>
              {done.map((listing) => (
                <ShelfBookRow
                  key={listing.id}
                  listing={listing}
                  supporting={shelfSupportingText(listing, now)}
                  hint="Abre o anúncio"
                  onPress={() =>
                    router.push({ pathname: '/livro/[id]', params: { id: listing.id } })
                  }
                />
              ))}
              <Note
                title="Cada livro, um novo capítulo"
                text="Suas negociações concluídas continuam aqui para você consultar."
              />
            </>
          ) : (
            <TabEmpty
              title="Nenhuma negociação concluída"
              text="Quando você concluir uma venda, troca ou doação, o livro aparecerá aqui."
              secondary={{ label: 'Ver minha estante', onPress: () => setTab('anuncios') }}
              primary={{ label: 'Explorar livros', onPress: () => router.push('/explorar') }}
            />
          )
        ) : null}
      </ScrollView>

      {/* Extended FAB pequeno do M3 (Figma 05.01, "Anunciar livro"). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Anunciar livro"
        onPress={announce}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <AppIcon name="add" color={colors.onSelected} />
        <Text style={styles.fabLabel}>Anunciar livro</Text>
      </Pressable>
    </SafeAreaView>
  );
}

/** A entrada "Rascunhos" do quadro 05.01. */
function DraftsEntry({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Rascunhos"
      accessibilityHint="Anúncios que você começou e ainda não publicou"
      onPress={onPress}
      style={({ pressed }) => [styles.draftsEntry, pressed && styles.draftsPressed]}
    >
      <AppIcon name="document" size={20} color={colors.onSurfaceVariant} />
      <View style={styles.draftsText}>
        <Text style={styles.draftsTitle}>Rascunhos</Text>
        <Text style={styles.footnote}>Anúncios que você começou e ainda não publicou.</Text>
      </View>
      <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

/**
 * 05.08 · Proposta encerrada.
 *
 * O quadro é uma tela inteira; aqui é um bloco dentro da aba Propostas. Levar
 * a pessoa a outra tela exigiria que a recusa — que acontece na negociação —
 * navegasse para cá, e a negociação é de outra feature.
 */
function ClosedProposals({
  items,
  onOpen,
}: {
  items: readonly { request: { id: string }; listing: { title: string } | null }[];
  onOpen: () => void;
}) {
  const router = useRouter();
  if (items.length === 0) return null;
  return (
    <View style={styles.notice}>
      <Text accessibilityRole="header" style={styles.noticeTitle}>
        Proposta encerrada.
      </Text>
      <Text style={styles.introText}>{closedProposalsLabel(items.length)}</Text>
      {items.map(({ request, listing }) => (
        <Text key={request.id} style={styles.footnote}>
          {`${listing?.title ?? 'Livro indisponível'} · recusada`}
        </Text>
      ))}
      <Text style={styles.footnote}>
        Essa proposta não reserva o anúncio. Seu livro pode receber novas propostas.
      </Text>
      <View style={styles.noticeActions}>
        <Button label="Ver meus anúncios" variant="secondary" onPress={onOpen} />
        <Button label="Abrir conversas" variant="text" onPress={() => router.push('/conversas')} />
      </View>
    </View>
  );
}

/** Estado vazio de uma aba (Figma 05.05 e 05.06). */
function TabEmpty({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text: string;
  primary: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.tabEmpty}>
      <Text style={styles.introTitle} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.introText}>{text}</Text>
      {secondary ? (
        <Button label={secondary.label} variant="secondary" onPress={secondary.onPress} />
      ) : null}
      <Button label={primary.label} onPress={primary.onPress} />
    </View>
  );
}

/** Nota no fim da lista (Figma 05.03 e 05.04). */
function Note({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.note}>
      <Text style={styles.noteTitle}>{title}</Text>
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  noticeTitle: { ...typography.brandTitle, color: colors.onSurface },
  noticeActions: { gap: spacing.xxs, paddingTop: spacing.xxs },
  draftsEntry: {
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.small,
  },
  draftsPressed: { backgroundColor: colors.pressed },
  draftsText: { flex: 1, gap: 2 },
  draftsTitle: { ...typography.bodyLarge, color: colors.onSurface },
  screen: { flex: 1, backgroundColor: colors.surface },
  // Barra superior pequena do M3: título de 22/28 alinhado à esquerda.
  appBar: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.xs,
    // Espaço para o botão flutuante não cobrir a última linha.
    paddingBottom: 96,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  intro: { gap: spacing.xs },
  introTitle: { ...typography.brandHeadline, color: colors.onSurface },
  introText: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  footnote: { ...typography.caption, color: colors.onSurfaceVariant },
  tabEmpty: { gap: spacing.md },
  note: {
    backgroundColor: colors.containerLow,
    borderRadius: radius.medium,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  noteTitle: { ...typography.titleMedium, color: colors.onSurface },
  noteText: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  emptyShelf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: metrics.pagePadding,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...typography.brandHeadline, color: colors.onSurface, textAlign: 'center' },
  emptyText: { ...typography.bodyLarge, color: colors.onSurfaceVariant, textAlign: 'center' },
  emptyActions: { alignSelf: 'stretch', marginTop: spacing.xs },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.selected,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fabPressed: { opacity: 0.88 },
  fabLabel: { ...typography.labelLarge, color: colors.onSelected },
});
