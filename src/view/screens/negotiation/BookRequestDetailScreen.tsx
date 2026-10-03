import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookRequestDetail } from '../../../factories/bookRequest';
import { confirmCopy, requestScreenCopy } from '../../../model/services/bookRequestFormat';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { MeetingCard } from '../../components/negotiation/MeetingCard';
import { OutcomeHero } from '../../components/negotiation/OutcomeHero';
import { RequestBookRow } from '../../components/negotiation/RequestBookRow';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/**
 * Negociação de um livro (Figma 06.03 a 06.18): a mesma tela mostra a proposta recebida ou
 * enviada, o encontro combinado, as confirmações e o retorno de cada etapa.
 */
export function BookRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useBookRequestDetail(String(id ?? ''));

  if (vm.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Carregando negociação…" />
      </View>
    );
  }

  if (vm.status === 'notFound' || vm.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          {vm.status === 'notFound' ? (
            <EmptyState
              title="Negociação não encontrada"
              message={vm.error ?? ''}
              actionLabel="Ver conversas"
              onAction={() => router.replace('/conversas')}
            />
          ) : (
            <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { request, listing, capabilities } = vm;
  if (!request || !listing) return null;

  const asOwner = capabilities.asOwner;
  const copy = requestScreenCopy(request, {
    asOwner,
    modality: listing.modality,
    ownerName: listing.ownerFirstName,
  });
  const openListing = () => router.push({ pathname: '/livro/[id]', params: { id: listing.id } });
  const error = vm.error ? <FormMessage tone="error" message={vm.error} /> : null;
  // Spec 029: a conversa vive dentro da negociação e fica aberta enquanto ela está em andamento.
  const chat = (
    <Button
      label="Abrir conversa"
      variant="secondary"
      onPress={() => router.push(`/negociacoes/${request.id}/conversa`)}
    />
  );

  // Figma 06.17, 06.11 e 06.07: confirmação antes de recusar, cancelar ou concluir.
  if (vm.confirming) {
    const text = confirmCopy(vm.confirming, {
      asOwner,
      ownerName: listing.ownerFirstName,
      listingTitle: listing.title,
    });
    const completing = vm.confirming === 'complete';
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <OutcomeHero title={text.title} body={text.body} />
          {error}
          <View style={styles.stack}>
            <Button
              label={completing ? text.confirm : text.keep}
              onPress={completing ? vm.confirm : vm.dismissConfirm}
              loading={completing && vm.busy}
            />
            <Button
              label={completing ? text.keep : text.confirm}
              variant={completing ? 'text' : 'danger'}
              onPress={completing ? vm.dismissConfirm : vm.confirm}
              loading={!completing && vm.busy}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Figma 06.05: logo depois de aceitar, o retorno com o encontro combinado.
  if (vm.lastAction === 'accepted' && request.status === 'accepted') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <OutcomeHero
            icon="check"
            title="Um encontro, um novo capítulo."
            body="Seu livro ficou reservado. Quem pediu recebe um aviso no app."
          />
          <MeetingCard request={request} />
          <RequestBookRow listing={listing} onPress={openListing} />
        </ScrollView>
        <ActionBar>
          <Button label="Acompanhar encontro" onPress={vm.clearLastAction} />
        </ActionBar>
      </SafeAreaView>
    );
  }

  // Figma 06.08, 06.12 e 06.18: a negociação terminou.
  if (
    request.status === 'completed' ||
    request.status === 'canceled' ||
    request.status === 'rejected'
  ) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <OutcomeHero
            icon={request.status === 'completed' ? 'checkCircle' : undefined}
            title={copy.title}
            body={copy.body}
          />
          <RequestBookRow listing={listing} onPress={openListing} />
        </ScrollView>
        <ActionBar>
          <Button label="Explorar livros" onPress={() => router.replace('/explorar')} />
          <Button
            label="Voltar às conversas"
            variant="text"
            onPress={() => router.replace('/conversas')}
          />
        </ActionBar>
      </SafeAreaView>
    );
  }

  // Figma 06.06: encontro combinado, à espera da entrega.
  if (request.status === 'accepted') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <OutcomeHero title={copy.title} body={copy.body} />
          <MeetingCard request={request} highlighted />
          <RequestBookRow listing={listing} onPress={openListing} />
          <Text style={styles.note}>Confira o estado do livro antes de concluir a negociação.</Text>
          {error}
          <View style={styles.stack}>
            {chat}
            {capabilities.canComplete && (
              <Button label="Concluir negociação" onPress={() => vm.askConfirm('complete')} />
            )}
            {capabilities.canCancel && (
              <Button
                label="Cancelar encontro"
                variant="danger"
                onPress={() => vm.askConfirm('cancel')}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Figma 06.03: proposta pendente (recebida por quem anunciou ou enviada por quem pediu).
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {asOwner ? (
          <Text style={styles.title} accessibilityRole="header">
            {copy.title}
          </Text>
        ) : (
          <OutcomeHero title={copy.title} body={copy.body} />
        )}
        <Text style={styles.label}>{asOwner ? 'Você entrega' : 'Você pediu'}</Text>
        <RequestBookRow listing={listing} onPress={openListing} />
        <Text style={styles.label}>Encontro proposto</Text>
        <MeetingCard request={request} />
        {asOwner && <Text style={styles.note}>{copy.body}</Text>}
        {chat}
        {error}
      </ScrollView>
      {asOwner ? (
        <ActionBar row>
          <View style={styles.flex}>
            <Button
              label="Recusar"
              variant="secondary"
              onPress={() => vm.askConfirm('reject')}
              disabled={vm.busy}
            />
          </View>
          <View style={styles.flex}>
            <Button label="Aceitar" onPress={vm.accept} loading={vm.busy} />
          </View>
        </ActionBar>
      ) : capabilities.canCancel ? (
        <ActionBar>
          <Button
            label="Cancelar proposta"
            variant="danger"
            onPress={() => vm.askConfirm('cancel')}
          />
        </ActionBar>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
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
  },
  label: { ...typography.labelLarge, color: colors.onSurfaceVariant, marginBottom: -spacing.xs },
  note: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  stack: { gap: spacing.xs },
  flex: { flex: 1 },
});
