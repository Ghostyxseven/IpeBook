import { useRef } from 'react';
import { StyleSheet, Text, type TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp } from '../../../factories/auth';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { colors, typography } from '../../theme/nativeTheme';

export function SignUpScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);
  const vm = useSignUp({
    onSignedUp: (email) => router.replace({ pathname: '/verificar-email', params: { email } }),
  });
  return (
    <AuthLayout
      title="Criar conta"
      description="Com uma conta, você vai poder anunciar, pedir e combinar livros com outros leitores."
      footer={
        <Button label="Já tenho conta" variant="text" onPress={() => router.replace('/entrar')} />
      }
    >
      <FormMessage tone="error" message={vm.errors.form} />
      <TextField
        label="Nome"
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
        returnKeyType="next"
        onSubmitEditing={() => confirmationRef.current?.focus()}
        submitBehavior="submit"
      />
      <TextField
        ref={confirmationRef}
        label="Confirmar senha"
        password
        value={vm.values.confirmation}
        onChangeText={(value) => vm.setField('confirmation', value)}
        error={vm.errors.confirmation}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={vm.submit}
      />
      <Text style={styles.legal}>
        Ao criar a conta, seu nome e e-mail são usados para identificar você no IpêBook, como
        descrito na Política de Privacidade.
      </Text>
      <Button label="Criar conta" onPress={vm.submit} loading={vm.submitting} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  legal: { ...typography.caption, color: colors.secondaryText },
});
