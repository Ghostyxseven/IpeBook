import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProposeMeeting } from '../../../factories/bookRequest';
import {
  meetingDayOptions,
  meetingHourLabel,
  meetingTimeOptions,
  proposedMeetingCopy,
} from '../../../model/services/bookRequestFormat';
import { ModalityChip } from '../../components/catalog/ModalityChip';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { MeetingCard } from '../../components/negotiation/MeetingCard';
import { OutcomeHero } from '../../components/negotiation/OutcomeHero';
import { PlacePicker } from '../../components/negotiation/PlacePicker';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TopAppBar } from '../../components/ui/TopAppBar';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Propor o primeiro encontro de uma conversa (ADR 0034): mesma forma de reagendar, mas
 * antes do aceite — sem a mudança ir no "Novo horário", como tudo em `pending`. */
export function ProposeMeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = String(id ?? '');
  const vm = useProposeMeeting(requestId);
  const days = useMemo(() => meetingDayOptions(new Date()), []);
  const leave = () =>
    router.canGoBack() ? router.back() : router.replace(`/negociacoes/${requestId}`);
  const other = vm.otherName?.trim() || 'A outra pessoa';

  if (vm.status !== 'ready' || vm.done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TopAppBar title="Propor encontro" onBack={leave} />
        {vm.status === 'loading' ? (
          <LoadingState message="Carregando conversa…" />
        ) : vm.status === 'error' ? (
          <View style={styles.content}>
            <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
          </View>
        ) : vm.status === 'closed' ? (
          <View style={styles.content}>
            <EmptyState
              title="Não dá para propor aqui"
              message="Só uma conversa sem encontro proposto ainda pode ganhar o primeiro."
              actionLabel="Voltar à negociação"
              onAction={leave}
            />
          </View>
        ) : vm.done ? (
          <>
            <ScrollView contentContainerStyle={styles.content}>
              <OutcomeHero icon="calendar" {...proposedMeetingCopy(vm.done, other)} />
              <MeetingCard request={vm.done} highlighted />
            </ScrollView>
            <ActionBar>
              <Button label="Voltar à negociação" onPress={leave} />
            </ActionBar>
          </>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopAppBar title="Propor encontro" onBack={leave} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title} accessibilityRole="header">
            Onde e quando vocês se encontram?
          </Text>
          <Text style={styles.body}>
            {`Escolha um local público, dia e horário. ${other} vê a proposta e decide aceitar.`}
          </Text>
          <PlacePicker label="Local" value={vm.publicLocation} onChange={vm.setPublicLocation} />

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

          <FormMessage tone="error" message={vm.error} />
        </ScrollView>
        <ActionBar>
          <Button
            label="Propor encontro"
            onPress={vm.submit}
            loading={vm.saving}
            disabled={!vm.canSubmit}
          />
          <Button label="Cancelar" variant="text" onPress={leave} disabled={vm.saving} />
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
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  title: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyLarge, color: colors.onSurfaceVariant, marginBottom: spacing.xs },
  section: { ...typography.labelLarge, color: colors.onSurface, marginTop: spacing.xs },
  bleed: { marginHorizontal: -metrics.pagePadding, flexGrow: 0 },
  chips: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: metrics.pagePadding },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xs },
});
