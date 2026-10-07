import { useRef } from 'react';
import type { TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp, useSocialAuth } from '../../../factories/auth';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Divider } from '../../components/ui/Divider';
import { FormMessage } from '../../components/ui/FormMessage';
import { SocialButton } from '../../components/ui/SocialButton';
import { TextField } from '../../components/ui/TextField';

export function SignUpScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const vm = useSignUp({
    onSignedUp: (email) => router.replace({ pathname: '/verificar-email', params: { email } }),
  });
  const social = useSocialAuth();
  return (
    <AuthLayout
      brand
      titleSize="headline"
      title="Crie sua conta"
      description="Anuncie, troque, venda ou doe livros perto de você."
      footer={
        <Button
          label="Já tenho conta"
          variant="secondary"
          onPress={() => router.replace('/entrar')}
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
      <Divider label="ou crie com e-mail" />
      <TextField
        label="Nome completo"
        value={vm.values.name}
        onChangeText={(value) => vm.setField('name', value)}
        error={vm.errors.name}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
      />
      <TextField
        ref={emailRef}
        label="E-mail"
        value={vm.values.email}
        onChangeText={(value) => vm.setField('email', value)}
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
        hint="Pelo menos 8 caracteres, com letras e números."
        value={vm.values.password}
        onChangeText={(value) => vm.setField('password', value)}
        error={vm.errors.password}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={vm.submit}
      />
      <Checkbox
        label="Aceito os termos de uso"
        supportingText="e a política de privacidade."
        checked={vm.acceptedTerms}
        onToggle={vm.toggleTerms}
        error={vm.errors.terms}
      />
      <Button label="Criar conta" onPress={vm.submit} loading={vm.submitting} />
      {vm.emailInUse && (
        <Button
          label="Recuperar senha"
          variant="text"
          onPress={() =>
            router.push({ pathname: '/recuperar-senha', params: { email: vm.values.email } })
          }
        />
      )}
    </AuthLayout>
  );
}
