import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../view/components/ui/Button';
import { useBlockUser } from '../../../factories/security';
import { colors, metrics, spacing, typography } from '../../../view/theme/nativeTheme';

export default function BlockScreen() {
  const params = useLocalSearchParams<{ userId: string; userName?: string }>();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const { submitting, error, submit } = useBlockUser(params.userId, {
    onSuccess: () => setSuccess(true),
  });

  const name = params.userName || 'este usuário';

  if (success) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.title}>Perfil bloqueado</Text>
          <Text style={styles.text}>Você bloqueou {name}. A conversa foi encerrada.</Text>
          <Text style={styles.text}>
            Você pode gerenciar perfis bloqueados e desbloquear futuramente nas configurações.
          </Text>

          <Button
            label="Denunciar também"
            variant="secondary"
            onPress={() =>
              router.replace({
                pathname: '/(app)/seguranca/report',
                params: { userId: params.userId },
              })
            }
          />
          <Button label="Voltar" onPress={() => router.dismissAll()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Bloquear {name}?</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.text}>
          Ao bloquear, essa pessoa não poderá mais enviar mensagens para você, e os anúncios dela
          não aparecerão mais no seu catálogo.
        </Text>
        <Text style={styles.textWarning}>
          Atenção: Se vocês tiverem um encontro marcado ou uma negociação pendente, você deve
          cancelar a adoção ou avisar pelo chat antes, pois a comunicação será interrompida.
        </Text>

        <Button label={submitting ? 'Bloqueando...' : 'Bloquear perfil'} onPress={submit} />
        <Button label="Cancelar" variant="secondary" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  title: { ...typography.titleLarge, color: colors.text },
  text: { ...typography.bodyLarge, color: colors.text, lineHeight: 24 },
  textWarning: { ...typography.bodyLarge, color: colors.error, fontWeight: 'bold', lineHeight: 24 },
  error: { color: colors.error },
});
