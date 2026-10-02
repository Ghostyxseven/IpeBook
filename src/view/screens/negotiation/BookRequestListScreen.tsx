import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RequestStatus } from '../../../model/entities/BookRequest';
import { useBookRequestList } from '../../../factories/bookRequest';
import { meetingWhen, requestListLabel } from '../../../model/services/bookRequestFormat';
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
 * Conversas (Figma 06.01): as negociações em que a pessoa pediu ou recebeu um pedido.
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
            Combine sempre em lugar público e movimentado. Não compartilhe senhas ou códigos.
          </Text>
        }
        renderItem={({ item }) => {
          const { request, listing, asOwner } = item;
          const bookTitle = listing?.title ?? 'Livro indisponível';
          const status = requestListLabel(request, { asOwner });
          const when = `${meetingWhen(request)} · ${request.publicLocation}`;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${bookTitle}. ${status}. ${when}`}
              accessibilityHint="Abre a negociação"
              onPress={() => router.push(`/negociacoes/${request.id}`)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View style={styles.avatar}>
                <AppIcon name={statusIcons[request.status]} color={colors.onSelected} />
              </View>
              <View style={styles.text}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {bookTitle}
                </Text>
                <Text style={styles.itemBody} numberOfLines={1}>
                  {status}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {when}
                </Text>
              </View>
              <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
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
  itemTitle: { ...typography.bodyLarge, color: colors.onSurface },
  itemBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  itemMeta: { ...typography.labelMedium, color: colors.action },
  footer: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginTop: spacing.md },
});
