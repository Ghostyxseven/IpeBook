import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, type TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePasswordRecovery } from '../../../factories/auth';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Snackbar } from '../../components/feedback/Snackbar';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { colors, typography } from '../../theme/nativeTheme';

export function PasswordRecoveryScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const vm = usePasswordRecovery(typeof email === 'string' ? email : '');
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);
  // Aviso "E-mail reenviado" sobre a própria tela, no iPhone (Figma 01.15): a ViewModel só
  // marca o reenvio; quem decide mostrar o vidro é a tela.
  const [resentToast, setResentToast] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'ios' && vm.resent) setResentToast(true);
  }, [vm.resent]);

  if (vm.step === 'request') {
    return (
      <AuthLayout
        brand
        title="Recupere seu"
        highlight="acesso."
        description="Digite seu e-mail para receber o código de redefinição de senha."
        footer={
          <>
            <Button
              label="Voltar ao login"
              variant="secondary"
              onPress={() => router.replace('/entrar')}
            />
            <Text style={styles.note}>Se você lembrar sua senha, faça login normalmente.</Text>
          </>
        }
      >
        <FormMessage tone="error" message={vm.errors.form} />
        <TextField
          label="E-mail"
          value={vm.values.email}
          onChangeText={(value) => vm.setField('email', value)}
          error={vm.errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={vm.requestCode}
        />
        <Button label="Enviar código" onPress={vm.requestCode} loading={vm.submitting} />
      </AuthLayout>
    );
  }

  return (
    <>
      {resentToast && (
        <Snackbar
          title="E-mail reenviado"
          message="Confira também a caixa de spam."
          onDismiss={() => setResentToast(false)}
        />
      )}
      <AuthLayout
        title="Um novo começo."
        description="Digite o código que enviamos e escolha uma senha com pelo menos 8 caracteres."
        footer={<Button label="Corrigir e-mail" variant="text" onPress={vm.changeEmail} />}
      >
        <FormMessage tone="success" message={vm.notice} />
        <FormMessage tone="error" message={vm.errors.form} />
        <TextField
          label="Código recebido"
          value={vm.values.code}
          onChangeText={(value) => vm.setField('code', value)}
          error={vm.errors.code}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={10}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextField
          ref={passwordRef}
          label="Nova senha"
          password
          hint="Use letras e números, e uma senha que você não usa em outro lugar."
          value={vm.values.password}
          onChangeText={(value) => vm.setField('password', value)}
          error={vm.errors.password}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmationRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextField
          ref={confirmationRef}
          label="Confirmar nova senha"
          password
          value={vm.values.confirmation}
          onChangeText={(value) => vm.setField('confirmation', value)}
          error={vm.errors.confirmation}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={vm.resetPassword}
        />
        <Button label="Salvar nova senha" onPress={vm.resetPassword} loading={vm.submitting} />
        <Button
          label={
            vm.resendSeconds > 0 ? `Reenviar código em ${vm.resendSeconds}s` : 'Reenviar código'
          }
          variant="secondary"
          onPress={vm.resend}
          disabled={vm.resendSeconds > 0}
          loading={vm.resending}
        />
      </AuthLayout>
    </>
  );
}

const styles = StyleSheet.create({
  note: { ...typography.bodyMedium, color: colors.onSurfaceVariant, textAlign: 'center' },
});
