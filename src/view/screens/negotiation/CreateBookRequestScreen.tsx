import { router, useLocalSearchParams } from 'expo-router';
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
import { ModalityChip } from '../../components/catalog/ModalityChip';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/**
 * Combinar encontro (Figma 06.04): onde, dia e horário. Os dias e horários são chips, como no
 * Figma; o local é escrito pela pessoa, porque o app ainda não tem lista de pontos públicos.
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

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.section} accessibilityRole="header">
            Onde
          </Text>
          <TextField
            label="Local público"
            placeholder="Ex.: Praça da Matriz, Biblioteca Municipal"
            autoCorrect={false}
            value={vm.publicLocation}
            onChangeText={vm.setPublicLocation}
            hint="Prefira lugares movimentados, como praças e bibliotecas."
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
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  section: { ...typography.labelLarge, color: colors.onSurface, marginTop: spacing.xs },
  bleed: { marginHorizontal: -metrics.pagePadding, flexGrow: 0 },
  chips: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: metrics.pagePadding },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xs },
});
