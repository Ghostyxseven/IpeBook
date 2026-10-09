import { useRef } from 'react';
import type { TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogin, useSocialAuth } from '../../../factories/auth';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Divider } from '../../components/ui/Divider';
import { FormMessage } from '../../components/ui/FormMessage';
import { SocialButton } from '../../components/ui/SocialButton';
import { TextField } from '../../components/ui/TextField';

export function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const vm = useLogin({
    onNeedsVerification: (email) =>
      router.push({ pathname: '/verificar-email', params: { email } }),
  });
  const social = useSocialAuth();
  return (
    <AuthLayout
      brand
      withoutHeader
      title="Sua próxima leitura começa aqui."
      description="Entre com o e-mail e a senha da sua conta."
      footer={
        <Button
          label="Criar uma conta"
          variant="text"
          onPress={() => router.push('/criar-conta')}
          accessibilityHint="Abre o cadastro"
        />
      }
    >
      <FormMessage tone="error" message={vm.errors.form} />
      <FormMessage tone="error" message={social.error} />
      <SocialButton
        label="Continuar com o Google"
        onPress={social.continueWithGoogle}
        loading={social.loading}
      />
      <Divider label="ou entre com e-mail" />
      <TextField
        label="E-mail"
        value={vm.email}
        onChangeText={vm.setEmail}
        error={vm.errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />
      <TextField
        ref={passwordRef}
        label="Senha"
        password
        value={vm.password}
        onChangeText={vm.setPassword}
        error={vm.errors.password}
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={vm.submit}
      />
      <Button label="Entrar" onPress={vm.submit} loading={vm.submitting} />
      <Button
        label="Esqueci minha senha"
        variant="text"
        onPress={() =>
          router.push({ pathname: '/recuperar-senha', params: vm.email ? { email: vm.email } : {} })
        }
      />
    </AuthLayout>
  );
}
