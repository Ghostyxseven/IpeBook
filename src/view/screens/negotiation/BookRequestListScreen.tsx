import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RequestStatus } from '../../../model/entities/BookRequest';
import { useBookRequestList } from '../../../factories/bookRequest';
import { requestListLabel } from '../../../model/services/bookRequestFormat';
import { conversationWhen, initials } from '../../../model/services/messageFormat';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Ícone de cada situação no círculo à esquerda da linha. */
const statusIcons: Record<RequestStatus, AppIconName> = {
  pending: 'swap',
  accepted: 'calendar',
  completed: 'checkCircle',
  rejected: 'close',
  canceled: 'close',
};

/**
 * Conversas (Figma 06.01): uma linha por negociação, com quem está do outro lado, a última
 * mensagem e o livro. Tocar abre a conversa (spec 029); dela se chega à negociação.
 * Na aba, a tela mostra o título; aberta pela pilha, o cabeçalho já o mostra.
 */
export function BookRequestListScreen({ showTitle = true }: { showTitle?: boolean }) {
  const vm = useBookRequestList();
  const { retry } = vm;

  // Ao voltar de uma negociação, a lista mostra a situação nova.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) firstFocus.current = false;
      else void retry();
    }, [retry]),
  );

  const title = showTitle ? (
    <Text style={styles.title} accessibilityRole="header">
      Conversas
    </Text>
  ) : null;

  if (vm.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Carregando negociações…" />
      </View>
    );
  }

  if (vm.status === 'error' || vm.status === 'empty') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          {title}
          {vm.status === 'error' ? (
            <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
          ) : (
            <EmptyState
              title="Nenhuma negociação"
              message="Quando você pedir um livro ou receber um pedido, a conversa aparece aqui."
              actionLabel="Explorar livros"
              onAction={() => router.replace('/explorar')}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={vm.items}
        keyExtractor={(item) => item.request.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={title}
        ListFooterComponent={
          <Text style={styles.footer}>
            Combine sempre pelo chat do IpêBook. Não compartilhe senhas ou códigos.
          </Text>
        }
        renderItem={({ item }) => {
          const { request, listing, asOwner, otherName, lastMessage } = item;
          const bookTitle = listing?.title ?? 'Livro indisponível';
          const status = requestListLabel(request, { asOwner });
          const name = otherName ?? (asOwner ? 'Quem pediu' : 'Quem anunciou');
          // Sem mensagem ainda, a linha mostra a situação da negociação no lugar dela.
          const body = lastMessage?.body ?? status;
          const when = conversationWhen(lastMessage?.createdAt ?? request.createdAt, new Date());
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${when}. ${body}. Sobre ${bookTitle}. ${status}`}
              accessibilityHint="Abre a conversa"
              onPress={() => router.push(`/negociacoes/${request.id}/conversa`)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View style={styles.avatar}>
                {otherName ? (
                  <Text style={styles.initials}>{initials(otherName)}</Text>
                ) : (
                  <AppIcon name={statusIcons[request.status]} color={colors.onSelected} />
                )}
              </View>
              <View style={styles.text}>
                <View style={styles.top}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.time}>{when}</Text>
                </View>
                <Text style={styles.itemBody} numberOfLines={1}>
                  {body}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {`Sobre ${bookTitle}`}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.xs,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  title: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  // Item de lista com três linhas (Figma 06.01): círculo, nome, mensagem e livro em verde.
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginHorizontal: -spacing.xs,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  itemTitle: { ...typography.bodyLarge, color: colors.onSurface, flex: 1 },
  time: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  initials: { ...typography.titleMedium, color: colors.onSelected },
  itemBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  itemMeta: { ...typography.labelMedium, color: colors.action },
  footer: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginTop: spacing.md },
});
