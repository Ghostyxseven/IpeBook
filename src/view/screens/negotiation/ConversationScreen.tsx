import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversation } from '../../../factories/messages';
import { MESSAGE_MAX, messageTime } from '../../../model/services/messageFormat';
import { AppIcon } from '../../components/AppIcon';
import { ListingCover } from '../../components/catalog/ListingCover';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { TopAppBar } from '../../components/ui/TopAppBar';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** De quanto em quanto tempo a conversa aberta busca mensagens novas. */
const REFRESH_MS = 10_000;

/** Conversa com quem está do outro lado da negociação (Figma 06.02, 06.10 e 06.16). */
export function ConversationScreen() {
  const { id, draft } = useLocalSearchParams<{ id: string; draft?: string }>();
  const requestId = String(id ?? '');
  const vm = useConversation(requestId);
  const list = useRef<FlatList>(null);
  const { refresh, setDraft } = vm;

  // Vindo do "Não comparecimento" (Figma 06.15), o relato já chega no campo para revisar.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || vm.status !== 'ready' || !draft) return;
    prefilled.current = true;
    setDraft(draft);
  }, [vm.status, draft, setDraft]);

  // Enquanto a tela está aberta, as respostas chegam sozinhas.
  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(() => void refresh(), REFRESH_MS);
      return () => clearInterval(timer);
    }, [refresh]),
  );

  const count = vm.messages.length;
  useEffect(() => {
    if (count > 0) list.current?.scrollToEnd({ animated: false });
  }, [count]);

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/conversas'));
  const title = vm.otherName ?? 'Conversa';

  if (vm.status === 'loading' || vm.status === 'error' || vm.status === 'notFound') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <TopAppBar title="Conversa" onBack={leave} />
        {vm.status === 'loading' ? (
          <LoadingState message="Carregando conversa…" />
        ) : (
          <ErrorState message={vm.loadError ?? ''} onRetry={vm.retry} />
        )}
      </SafeAreaView>
    );
  }

  const listing = vm.listing;
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TopAppBar title={title} onBack={leave} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.bookCard}>
          {listing ? <ListingCover listing={listing} variant="shelf" /> : null}
          <View style={styles.bookText}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {listing?.title ?? 'Livro indisponível'}
            </Text>
            {listing ? <StatusBadge variant={listing.modality} /> : null}
          </View>
          <Button
            label="Negociação"
            variant="text"
            accessibilityHint="Abre o pedido com local, data e horário"
            onPress={() => router.push(`/negociacoes/${requestId}`)}
          />
        </View>

        <FlatList
          ref={list}
          data={vm.messages}
          keyExtractor={(message) => message.id}
          contentContainerStyle={styles.messages}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {vm.open
                ? `Comece a conversa com ${vm.otherName ?? 'a outra pessoa'}. Combine pelo IpêBook e não compartilhe senhas ou códigos.`
                : 'Esta negociação não teve mensagens.'}
            </Text>
          }
          renderItem={({ item }) => {
            const mine = vm.isMine(item);
            return (
              <View
                style={[styles.bubble, mine ? styles.mine : styles.theirs]}
                accessible
                accessibilityLabel={`${mine ? 'Você' : (vm.otherName ?? 'Outra pessoa')}, ${messageTime(item.createdAt)}: ${item.body}`}
              >
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{messageTime(item.createdAt)}</Text>
              </View>
            );
          }}
        />

        {vm.sendError ? (
          <View style={styles.alert} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <AppIcon name="error" size={18} color={colors.error} />
            <Text style={styles.alertText}>{vm.sendError}</Text>
          </View>
        ) : null}

        {vm.open ? (
          <View style={styles.composer}>
            <TextInput
              value={vm.draft}
              onChangeText={vm.setDraft}
              placeholder="Escreva uma mensagem"
              placeholderTextColor={colors.onSurfaceVariant}
              accessibilityLabel="Mensagem"
              multiline
              maxLength={MESSAGE_MAX}
              editable={!vm.sending}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.sendError ? 'Tentar enviar de novo' : 'Enviar mensagem'}
              accessibilityState={{ disabled: !vm.canSend, busy: vm.sending }}
              disabled={!vm.canSend}
              onPress={vm.send}
              style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                styles.send,
                pressed && styles.pressed,
                focused && styles.focused,
              ]}
            >
              <AppIcon name="send" color={vm.canSend ? colors.onSurface : colors.disabledText} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.composer}>
            <Text style={styles.closed}>
              Esta negociação foi encerrada. A conversa fica só para consulta.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: metrics.pagePadding,
    marginBottom: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  bookText: { flex: 1, gap: spacing.xxs },
  bookTitle: { ...typography.bodyMedium, fontWeight: '500', color: colors.onSurface },
  messages: {
    flexGrow: 1,
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  empty: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.medium,
    gap: spacing.xxs,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.selected },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.containerHigh },
  body: { ...typography.bodyLarge, color: colors.onSurface },
  time: { ...typography.caption, color: colors.onSurfaceVariant },
  alert: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.xs,
  },
  alertText: { ...typography.bodyMedium, color: colors.error, flex: 1 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.containerLow,
  },
  input: {
    flex: 1,
    minHeight: metrics.touchTarget,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    borderRadius: metrics.fieldRadius,
    color: colors.onSurface,
    ...typography.bodyLarge,
  },
  send: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: metrics.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.pressed },
  closed: { ...typography.bodyMedium, color: colors.onSurfaceVariant, flex: 1 },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
});
