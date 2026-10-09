import { useRef } from 'react';
import { ActivityIndicator, type TextInput } from 'react-native';
import type { User } from '../../../model/entities/User';
import { useGoogleRegistration } from '../../../factories/googleRegistration';
import { AuthLayout } from '../../components/ui/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';

/** Complemento do cadastro com os componentes de acesso das três plataformas. */
export function GoogleRegistrationScreen({ user }: { user: User }) {
  const vm = useGoogleRegistration(user);
  const neighborhoodRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);
  return (
    <AuthLayout
      brand
      withoutHeader
      titleSize="headline"
      title="Complete seu cadastro"
      description="Confirme seu nome, informe seu bairro e crie uma senha do IpêBook."
      footer={
        <Button label="Sair desta conta" variant="text" onPress={vm.signOut} disabled={vm.busy} />
      }
    >
      <FormMessage tone="error" message={vm.errors.form} />
      {vm.status === 'loading' && (
        <ActivityIndicator accessibilityLabel="Carregando seu cadastro" />
      )}
      {vm.status === 'error' && (
        <>
          <FormMessage tone="error" message={vm.loadError} />
          <Button label="Tentar novamente" onPress={vm.retry} disabled={vm.busy} />
        </>
      )}
      {vm.status === 'ready' && (
        <>
          <TextField
            label="E-mail da conta Google"
            value={vm.email}
            editable={false}
            hint="Você poderá entrar no IpêBook com Google ou com este e-mail e a nova senha."
          />
          <TextField
            label="Nome completo"
            value={vm.values.name}
            onChangeText={(value) => vm.setField('name', value)}
            error={vm.errors.name}
            editable={!vm.busy}
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => neighborhoodRef.current?.focus()}
          />
          <TextField
            ref={neighborhoodRef}
            label="Bairro onde você mora"
            value={vm.values.neighborhood}
            onChangeText={(value) => vm.setField('neighborhood', value)}
            error={vm.errors.neighborhood}
            hint={`Cidade atendida: ${vm.city}.`}
            editable={!vm.busy}
            autoCapitalize="words"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label="Senha do IpêBook"
            password
            value={vm.values.password}
            onChangeText={(value) => vm.setField('password', value)}
            error={vm.errors.password}
            hint="Pelo menos 8 caracteres, com letras e números. Não altera sua senha do Google."
            editable={!vm.busy}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmationRef.current?.focus()}
          />
          <TextField
            ref={confirmationRef}
            label="Confirmar senha"
            password
            value={vm.values.confirmation}
            onChangeText={(value) => vm.setField('confirmation', value)}
            error={vm.errors.confirmation}
            editable={!vm.busy}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={vm.submit}
          />
          <Checkbox
            label="Aceito os termos de uso"
            supportingText="e a política de privacidade."
            checked={vm.acceptedTerms}
            onToggle={vm.busy ? () => {} : vm.toggleTerms}
            error={vm.errors.terms}
          />
          <Button label="Concluir cadastro" onPress={vm.submit} loading={vm.busy} />
        </>
      )}
    </AuthLayout>
  );
}
