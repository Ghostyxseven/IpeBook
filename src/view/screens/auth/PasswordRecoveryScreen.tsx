import { useRef } from 'react';
import type { TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePasswordRecovery } from '../../../factories/auth';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';

export function PasswordRecoveryScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const vm = usePasswordRecovery(typeof email === 'string' ? email : '');
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);

  if (vm.step === 'request') {
    return (
      <AuthLayout
        title="Recuperar senha"
        description="Informe o e-mail da sua conta. Vamos enviar um código para você criar uma nova senha."
        footer={
          <Button
            label="Voltar para Entrar"
            variant="text"
            onPress={() => router.replace('/entrar')}
          />
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
    <AuthLayout
      title="Crie uma nova senha"
      footer={<Button label="Usar outro e-mail" variant="text" onPress={vm.changeEmail} />}
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
        hint="Pelo menos 8 caracteres, com letras e números."
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
      <Button
        label="Salvar nova senha e entrar"
        onPress={vm.resetPassword}
        loading={vm.submitting}
      />
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
