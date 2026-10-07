import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, type TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChangePassword } from '../../../factories/auth';
import { useSessionContext } from '../../../viewmodel/useSession';
import type { ChangePasswordState } from '../../../viewmodel/useChangePasswordViewModel';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Título, explicação e nota de cada estado (Figma 07.18 a 07.21). */
const copy: Record<ChangePasswordState, { title: string; description: string; note: string }> = {
  form: {
    title: 'Mais segurança no seu acesso.',
    description: 'Informe sua senha atual e escolha uma nova senha.',
    note: 'Use pelo menos 8 caracteres, com letras e números, e uma senha que você não utiliza em outro lugar.',
  },
  wrongCurrent: {
    title: 'Confira sua senha atual.',
    description: 'Não conseguimos confirmar a senha informada.',
    note: 'Digite novamente ou recupere seu acesso pelo e-mail da conta.',
  },
  invalidNew: {
    title: 'Confira a nova senha.',
    description:
      'Ela precisa ter pelo menos 8 caracteres, com letras e números. A confirmação deve ser igual à nova senha.',
    note: 'Digite os dois campos novamente para salvar.',
  },
  done: {
    title: 'Sua senha foi alterada.',
    description: 'Use a nova senha no próximo acesso à sua conta.',
    note: 'Mantenha sua senha privada.',
  },
};

export function ChangePasswordScreen() {
  const router = useRouter();
  const session = useSessionContext();
  const vm = useChangePassword({ email: session.user?.email ?? null });
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);
  const text = copy[vm.state];
  // 07.19 mostra só a senha atual; 07.21 só a nova senha e a confirmação.
  const showCurrent = vm.state === 'form' || vm.state === 'wrongCurrent';
  const showNew = vm.state === 'form' || vm.state === 'invalidNew';

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {text.title}
            </Text>
            <Text style={styles.description}>{text.description}</Text>
          </View>
          {vm.state !== 'done' && (
            <View style={styles.form}>
              <FormMessage tone="error" message={vm.errors.form} />
              {showCurrent && (
                <TextField
                  label="Senha atual"
                  password
                  value={vm.values.current}
                  onChangeText={(value) => vm.setField('current', value)}
                  error={vm.errors.current}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType={showNew ? 'next' : 'go'}
                  onSubmitEditing={() => (showNew ? passwordRef.current?.focus() : vm.submit())}
                  submitBehavior={showNew ? 'submit' : undefined}
                />
              )}
              {showNew && (
                <>
                  <TextField
                    ref={passwordRef}
                    label="Nova senha"
                    password
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
                    onSubmitEditing={vm.submit}
                  />
                </>
              )}
            </View>
          )}
          <Text style={styles.note}>{text.note}</Text>
          <View style={styles.actions}>
            {vm.state === 'done' ? (
              <>
                <Button label="Voltar à segurança" onPress={() => router.replace('/seguranca')} />
                <Button
                  label="Voltar às configurações"
                  variant="text"
                  onPress={() => router.back()}
                />
              </>
            ) : (
              <>
                <Button
                  label={
                    vm.state === 'wrongCurrent'
                      ? 'Tentar novamente'
                      : vm.state === 'invalidNew'
                        ? 'Corrigir nova senha'
                        : 'Salvar nova senha'
                  }
                  onPress={vm.submit}
                  loading={vm.submitting}
                />
                {vm.state !== 'invalidNew' && (
                  <Button
                    label={
                      vm.state === 'wrongCurrent' ? 'Recuperar acesso' : 'Esqueci a senha atual'
                    }
                    variant="text"
                    onPress={vm.recoverAccess}
                    loading={vm.leaving}
                    accessibilityHint="Sai da conta e envia um código para o seu e-mail"
                  />
                )}
                {vm.state !== 'wrongCurrent' && (
                  <Button label="Cancelar" variant="text" onPress={() => router.back()} />
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, padding: metrics.pagePadding },
  content: { width: '100%', maxWidth: metrics.formMaxWidth, alignSelf: 'center', gap: spacing.lg },
  header: { gap: spacing.xs },
  title: { ...typography.brandHeadline, color: colors.onSurface },
  description: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  form: { gap: spacing.md },
  note: { ...typography.caption, color: colors.onSurfaceVariant },
  actions: { gap: spacing.xs },
});
