import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateBookRequest } from '../../../factories/bookRequest';
import {
  meetingDayOptions,
  meetingHourLabel,
  meetingTimeOptions,
} from '../../../model/services/bookRequestFormat';
import { useSessionContext } from '../../../viewmodel/useSession';
import { AppIcon } from '../../components/AppIcon';
import { ModalityChip } from '../../components/catalog/ModalityChip';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { MeetingPointField } from '../../components/maps/MeetingPointField';
import { PlacePicker } from '../../components/negotiation/PlacePicker';
import { OfferPicker } from '../../components/negotiation/OfferPicker';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/**
 * Combinar encontro (Figma 06.04): onde, dia e horário. Os dias e horários são chips, como no
 * Figma; o "Onde" oferece atalhos de lugar público e aceita outro local escrito (06.04).
 * Na troca, o primeiro passo é Propor troca (Figma 03.05): escolher o livro oferecido.
 */
export function CreateBookRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useSessionContext();
  const vm = useCreateBookRequest(String(id ?? ''));
  const days = useMemo(() => meetingDayOptions(new Date()), []);

  // Depois de enviar, abre a negociação criada.
  useEffect(() => {
    if (vm.submitted) router.replace(`/negociacoes/${vm.submitted}`);
  }, [vm.submitted]);

  if (session.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Preparando formulário…" />
      </View>
    );
  }
  if (session.status === 'signedOut') {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <ErrorState
            message="Você precisa entrar para combinar um encontro."
            onRetry={() => router.replace('/entrar')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (vm.step === 'offer') {
    const ownerName = vm.listing?.ownerFirstName?.trim() || 'Quem anunciou';
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ title: 'Propor troca' }} />
        {vm.offerStatus === 'loading' ? (
          <LoadingState message="Carregando seus livros…" />
        ) : vm.offerStatus === 'error' ? (
          <View style={styles.content}>
            <ErrorState
              message="Não conseguimos carregar seus livros. Confira sua conexão."
              onRetry={vm.retryOffer}
            />
          </View>
        ) : vm.offerOptions.length === 0 ? (
          <View style={styles.content}>
            <EmptyState
              title="Você ainda não tem livro para oferecer"
              message="Para propor uma troca, publique primeiro o livro que você quer oferecer."
              actionLabel="Anunciar um livro"
              onAction={() => router.push('/anunciar')}
            />
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content}>
              {vm.listing ? (
                <OfferPicker
                  wanted={vm.listing}
                  ownerName={ownerName}
                  options={vm.offerOptions}
                  selectedId={vm.offeredListingId}
                  onSelect={vm.chooseOffer}
                />
              ) : null}
              <Button
                label="Oferecer outro livro"
                variant="text"
                accessibilityHint="Abre o formulário para anunciar um livro"
                onPress={() => router.push('/anunciar')}
              />
              <View style={styles.note}>
                <AppIcon name="info" size={18} color={colors.onSurfaceVariant} />
                <Text style={styles.noteText}>
                  {`A proposta só vira encontro quando ${ownerName} aceitar.`}
                </Text>
              </View>
            </ScrollView>
            <ActionBar>
              <Button
                label="Escolher local e horário"
                onPress={vm.continueToMeeting}
                disabled={!vm.offeredListing}
              />
            </ActionBar>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Combinar encontro' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {vm.offeredListing ? (
            <View style={styles.offer}>
              <Text style={styles.noteText}>{`Você oferece ${vm.offeredListing.title}`}</Text>
              <Button label="Trocar livro" variant="text" onPress={vm.backToOffer} />
            </View>
          ) : null}
          <Text style={styles.section} accessibilityRole="header">
            Onde
          </Text>
          <PlacePicker value={vm.publicLocation} onChange={vm.setPublicLocation} />
          <MeetingPointField
            value={vm.meetingPoint}
            onChange={vm.chooseMeetingPoint}
            disabled={vm.submitting}
          />

          <Text style={styles.section} accessibilityRole="header">
            Dia
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.chips}
            accessibilityLabel="Dia do encontro"
          >
            {days.map((day) => (
              <ModalityChip
                key={day.value}
                modality="all"
                label={day.label}
                selected={vm.meetingDate === day.value}
                onPress={() => vm.setMeetingDate(day.value)}
              />
            ))}
          </ScrollView>

          <Text style={styles.section} accessibilityRole="header">
            Horário
          </Text>
          <View style={styles.wrap} accessibilityLabel="Horário do encontro">
            {meetingTimeOptions.map((time) => (
              <ModalityChip
                key={time}
                modality="all"
                label={meetingHourLabel(time)}
                selected={vm.meetingTime === time}
                onPress={() => vm.setMeetingTime(time)}
              />
            ))}
          </View>

          {vm.error ? <FormMessage tone="error" message={vm.error} /> : null}
        </ScrollView>
        <ActionBar>
          <Button
            label="Enviar convite"
            onPress={() => void vm.submit()}
            loading={vm.submitting}
            disabled={!vm.isFormValid}
            accessibilityHint="Quem anunciou recebe a proposta e pode aceitar ou recusar."
          />
        </ActionBar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.readingMaxWidth,
    alignSelf: 'center',
  },
  section: { ...typography.labelLarge, color: colors.onSurface, marginTop: spacing.xs },
  bleed: { marginHorizontal: -metrics.pagePadding, flexGrow: 0 },
  chips: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: metrics.pagePadding },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xs },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  noteText: { ...typography.bodyMedium, color: colors.onSurfaceVariant, flex: 1 },
  offer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
