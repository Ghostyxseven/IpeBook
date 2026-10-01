import { useRef } from 'react';
import type { TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogin } from '../../../factories/auth';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';

export function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const vm = useLogin({
    onNeedsVerification: (email) =>
      router.push({ pathname: '/verificar-email', params: { email } }),
  });
  return (
    <AuthLayout
      title="Entrar"
      description="Que bom ter você de volta. Entre para encontrar, trocar e doar livros em Piripiri."
      footer={
        <>
          <Button
            label="Criar conta"
            variant="secondary"
            onPress={() => router.push('/criar-conta')}
            accessibilityHint="Abre o cadastro"
          />
        </>
      }
    >
      <FormMessage tone="error" message={vm.errors.form} />
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
