import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateBookRequest } from '../../../factories/bookRequest';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { useEffect } from 'react';
import { useSessionContext } from '../../../viewmodel/useSession';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import { FormMessage } from '../../components/ui/FormMessage';

/**
 * Tela de criação da solicitação de encontro (botão "Combinar encontro").
 * Ponto público + data (YYYY-MM-DD) + horário (HH:MM).
 */
export function CreateBookRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useSessionContext();
  const vm = useCreateBookRequest(String(id ?? ''));

  // Redireciona para tela de detalhe da solicitação após criação bem-sucedida
  useEffect(() => {
    if (vm.submitted) {
      router.replace(`/negociacoes/${vm.submitted}`);
    }
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
            message="Você precisa entrar para solicitar um encontro."
            onRetry={() => router.replace('/entrar')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Combinar encontro
            </Text>
            <View style={{ alignSelf: 'flex-start' }}>
              <StatusBadge variant="reserved" />
            </View>
            <Text style={styles.subtitle}>
              Escolha um local público, dia e horário. O dono do livro receberá sua proposta.
            </Text>
          </View>

          <TextField
            label="Ponto público"
            placeholder="Ex.: Praça das Flores, Biblioteca Central..."
            autoCorrect={false}
            value={vm.publicLocation}
            onChangeText={vm.setPublicLocation}
            hint="Escolha um local seguro, como praças ou bibliotecas."
          />

          <TextField
            label="Dia do encontro"
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.secondaryText}
            autoCorrect={false}
            keyboardType={Platform.select({ ios: 'numbers-and-punctuation', default: 'default' })}
            value={vm.meetingDate}
            onChangeText={vm.setMeetingDate}
            hint="Formato: 2026-10-30 (ano-mês-dia)."
          />

          <TextField
            label="Horário"
            placeholder="HH:MM"
            placeholderTextColor={colors.secondaryText}
            autoCorrect={false}
            keyboardType={Platform.select({ ios: 'numbers-and-punctuation', default: 'default' })}
            value={vm.meetingTime}
            onChangeText={vm.setMeetingTime}
            hint="Formato 24h: ex. 09:30 ou 16:00)."
          />

          {vm.error ? <FormMessage tone="error" message={vm.error} /> : null}

          <View style={styles.footer}>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={() => router.back()}
              disabled={vm.submitting}
            />
            <Button
              label="Enviar solicitação"
              onPress={() => vm.submit()}
              loading={vm.submitting}
              disabled={!vm.isFormValid || vm.submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    paddingTop: spacing.md,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
    paddingBottom: spacing.lg,
  },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  title: { ...typography.titleLarge, color: colors.text },
  subtitle: { ...typography.bodyMedium, color: colors.secondaryText },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
