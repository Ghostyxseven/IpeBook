import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVerifyEmail } from '../../../factories/auth';
import { ErrorState } from '../../components/feedback/ErrorState';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { colors, typography } from '../../theme/nativeTheme';

export function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const vm = useVerifyEmail(typeof email === 'string' ? email : '');

  if (vm.missingEmail) {
    return (
      <AuthLayout title="Confirmar e-mail">
        <ErrorState
          title="Não sabemos qual e-mail confirmar"
          message="Volte para Entrar ou crie sua conta para receber um novo código."
        />
        <Button label="Ir para Entrar" onPress={() => router.replace('/entrar')} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Confirme seu e-mail."
      description={`Enviamos um código para ${vm.email}. Digite-o abaixo para confirmar seu endereço e continuar.`}
      footer={
        <>
          <Button
            label="Corrigir e-mail"
            variant="text"
            onPress={() => router.replace('/criar-conta')}
          />
          <Text style={styles.note}>
            Não chegou? Confira a caixa de spam e se o endereço está correto.
          </Text>
        </>
      }
    >
      <FormMessage tone="error" message={vm.formError} />
      <FormMessage tone="success" message={vm.notice} />
      <TextField
        label="Código de confirmação"
        value={vm.code}
        onChangeText={vm.setCode}
        error={vm.error}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={10}
        returnKeyType="go"
        onSubmitEditing={vm.verify}
      />
      <Button label="Confirmar e entrar" onPress={vm.verify} loading={vm.submitting} />
      <Button
        label={vm.resendSeconds > 0 ? `Reenviar código em ${vm.resendSeconds}s` : 'Reenviar código'}
        variant="secondary"
        onPress={vm.resend}
        disabled={vm.resendSeconds > 0}
        loading={vm.resending}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  note: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});
