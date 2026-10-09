import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookRequestDetail } from '../../../factories/bookRequest';
import { useCompletionRating } from '../../../factories/reputation';
import {
  confirmCopy,
  offeredLabel,
  requestScreenCopy,
} from '../../../model/services/bookRequestFormat';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { MeetingCard } from '../../components/negotiation/MeetingCard';
import { OutcomeHero } from '../../components/negotiation/OutcomeHero';
import { CounterOfferSheet } from '../../components/negotiation/CounterOfferSheet';
import { RequestBookRow } from '../../components/negotiation/RequestBookRow';
import { RatingForm } from '../../components/profile/RatingForm';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Negociação de um livro (Figma 06.03 a 06.18): a mesma tela mostra a proposta recebida ou
 * enviada, o encontro combinado, as confirmações e o retorno de cada etapa.
 */
export function BookRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = String(id ?? '');
  const vm = useBookRequestDetail(requestId);

  // Qual livro da estante de quem propôs o dono escolheu na folha (Figma 06.19).
  const [counterChoice, setCounterChoice] = useState<string | null>(null);

  const rating = useCompletionRating(requestId);
  const [rateOpen, setRateOpen] = useState(false);

  // `rating` lê o histórico uma vez, ao montar. Concluir aqui muda o status local sem
  // passar por essa leitura, então sem isto o convite para avaliar só apareceria numa
  // visita seguinte à tela — recarrega assim que a conclusão acontece nesta sessão.
  const wasCompleted = useRef(vm.request?.status === 'completed');
  useEffect(() => {
    const isCompleted = vm.request?.status === 'completed';
    if (isCompleted && !wasCompleted.current) rating.retry();
    wasCompleted.current = isCompleted;
    // `rating.retry` é estável (memoizado pelo repositório); só `rating.retry` entra
    // na lista, não `rating` inteiro, que é um objeto novo a cada render.
  }, [vm.request?.status, rating.retry]);

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
    requesterName: vm.requesterName,
  });
  const openListing = () => router.push({ pathname: '/livro/[id]', params: { id: listing.id } });
  const error = vm.error ? <FormMessage tone="error" message={vm.error} /> : null;
  const offered = vm.offeredListing;
  // Na troca, o livro oferecido aparece junto do pedido (Figma 03.05 e 06.03).
  const offeredRow = offered ? (
    <>
      <Text style={styles.label}>{offeredLabel({ asOwner })}</Text>
      <RequestBookRow
        listing={offered}
        showModality={false}
        onPress={() => router.push({ pathname: '/livro/[id]', params: { id: offered.id } })}
      />
    </>
  ) : null;
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
      requesterName: vm.requesterName,
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
            body={`Seu livro ficou reservado. ${vm.requesterName ?? 'Quem pediu'} recebe um aviso no app.`}
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
          {/* Avaliar aqui mesmo (spec 028): só na conclusão, e só de quem ainda não avaliou. */}
          {request.status === 'completed' ? (
            rating.justRated ? (
              <Text style={styles.rated}>Avaliação enviada. Obrigado!</Text>
            ) : rating.canRate ? (
              <View style={styles.rate}>
                <Text style={styles.rateTitle} accessibilityRole="header">
                  {rating.otherFirstName
                    ? `Como foi o encontro com ${rating.otherFirstName}?`
                    : 'Como foi o encontro?'}
                </Text>
                <FormMessage tone="error" message={rating.error} />
                {rateOpen ? (
                  <RatingForm
                    submitting={rating.submitting}
                    onSubmit={(score, comment) => void rating.rate(score, comment)}
                    onCancel={() => setRateOpen(false)}
                  />
                ) : (
                  <Button
                    label="Avaliar"
                    variant="secondary"
                    onPress={() => setRateOpen(true)}
                    accessibilityHint="A avaliação é pública e não dá para editar depois."
                  />
                )}
              </View>
            ) : null
          ) : null}
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
          {offeredRow}
          <Text style={styles.note}>Confira o estado do livro antes de concluir a negociação.</Text>
          {error}
          <View style={styles.stack}>
            {chat}
            <Button
              label="Reagendar encontro"
              variant="secondary"
              onPress={() => router.push(`/negociacoes/${request.id}/reagendar`)}
            />
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
            <Button
              label="O encontro não aconteceu?"
              variant="text"
              onPress={() => router.push(`/negociacoes/${request.id}/nao-compareceu`)}
            />
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
        {offeredRow}
        {request.publicLocation ? (
          <>
            <Text style={styles.label}>Encontro proposto</Text>
            <MeetingCard request={request} />
          </>
        ) : (
          // ADR 0035: "Conversar" abre sem encontro algum; qualquer um dos dois propõe.
          <View style={styles.propose}>
            <Text style={styles.note}>Ainda não há encontro proposto.</Text>
            <Button
              label="Propor encontro"
              variant="secondary"
              onPress={() => router.push(`/negociacoes/${request.id}/propor-encontro`)}
            />
          </View>
        )}
        {asOwner && <Text style={styles.note}>{copy.body}</Text>}
        {/* Contraproposta de pé: quem propôs responde, e o dono espera (Figma 06.19). */}
        {request.counterListingId ? (
          <View style={styles.counter}>
            <Text style={styles.counterTitle}>
              {capabilities.canAnswerCounter
                ? `${vm.other.name ?? 'Quem anunciou'} pediu outro livro seu`
                : 'Contraproposta enviada'}
            </Text>
            {vm.counterListing ? (
              <RequestBookRow
                listing={vm.counterListing}
                onPress={() => router.push(`/livros/${vm.counterListing!.id}`)}
              />
            ) : (
              <FormMessage
                tone="error"
                message="Não conseguimos carregar o livro solicitado. Reabra a negociação antes de aceitar."
              />
            )}
            <Text style={styles.note}>
              {capabilities.canAnswerCounter
                ? 'Aceitar fecha a troca com esse livro no lugar do que você ofereceu.'
                : `Aguardando ${vm.other.name ?? 'quem pediu'} aceitar ou recusar.`}
            </Text>
            {capabilities.canAnswerCounter ? (
              <>
                <Button
                  label="Aceitar contraproposta"
                  disabled={!vm.counterListing}
                  loading={vm.busy}
                  onPress={() => void vm.answerCounter(true)}
                />
                <Button
                  label="Recusar"
                  variant="secondary"
                  disabled={vm.busy}
                  onPress={() => void vm.answerCounter(false)}
                />
              </>
            ) : null}
          </View>
        ) : null}
        {capabilities.canCounter ? (
          <Button
            label="Fazer contraproposta"
            disabled={vm.busy}
            variant="text"
            onPress={() => {
              setCounterChoice(null);
              void vm.openCounter();
            }}
          />
        ) : null}
        {chat}
        {error}
      </ScrollView>
      <CounterOfferSheet
        visible={vm.shelfStatus !== 'idle'}
        status={vm.shelfStatus}
        shelf={vm.shelf}
        otherName={vm.other.name ?? 'quem pediu'}
        listingTitle={listing.title}
        selected={counterChoice}
        onSelect={setCounterChoice}
        submitting={vm.busy}
        error={vm.counterError}
        onRetry={() => void vm.openCounter()}
        onClose={vm.closeCounter}
        onSubmit={() => counterChoice && void vm.counterOffer(counterChoice)}
      />
      {capabilities.canAccept ? (
        <ActionBar row>
          <View style={styles.flex}>
            <Button
              label="Recusar"
              variant="secondary"
              onPress={() => vm.askConfirm('reject')}
              disabled={vm.busy}
            />
          </View>
          {/* Sem encontro proposto, não tem o que aceitar ainda (ADR 0035) — o banco
              também recusaria. */}
          {request.publicLocation && (
            <View style={styles.flex}>
              <Button label="Aceitar" onPress={vm.accept} loading={vm.busy} />
            </View>
          )}
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
  counter: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  counterTitle: { ...typography.titleMedium, color: colors.onSurface },
  rate: { gap: spacing.xs, marginTop: spacing.xs },
  rateTitle: { ...typography.titleMedium, color: colors.onSurface },
  rated: { ...typography.labelLarge, color: colors.action, marginTop: spacing.xs },
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
  propose: { gap: spacing.xs },
  stack: { gap: spacing.xs },
  flex: { flex: 1 },
});
