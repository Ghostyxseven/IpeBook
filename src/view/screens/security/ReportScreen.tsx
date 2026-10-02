import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../view/components/ui/Button';
import { useReport } from '../../../factories/security';
import { colors, metrics, spacing, typography } from '../../../view/theme/nativeTheme';

const MOTIVES = ['Spam', 'Falso', 'Assédio', 'Inadequado', 'Outro'];

export default function ReportScreen() {
  const params = useLocalSearchParams<{ userId?: string; listingId?: string }>();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const { reason, setReason, details, setDetails, submitting, error, submit } = useReport(
    { userId: params.userId ?? null, listingId: params.listingId ?? null },
    { onSuccess: () => setSuccess(true) },
  );

  if (success) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.title}>Denúncia recebida</Text>
          <Text style={styles.text}>
            Sua denúncia está em análise. Ela será tratada com privacidade e segurança.
          </Text>
          <Button label="Voltar" onPress={() => router.dismissAll()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Fazer denúncia</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Motivo:</Text>
        <View style={styles.motives}>
          {MOTIVES.map((m) => (
            <Button
              key={m}
              label={m}
              variant={reason === m ? 'primary' : 'secondary'}
              onPress={() => setReason(m)}
            />
          ))}
        </View>

        <Text style={styles.label}>Detalhes (opcional):</Text>
        <TextInput style={styles.input} value={details} onChangeText={setDetails} multiline />

        <Button label={submitting ? 'Enviando...' : 'Enviar denúncia'} onPress={submit} />
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
  text: { ...typography.bodyLarge, color: colors.text },
  label: { ...typography.labelMedium, color: colors.text, marginTop: spacing.sm },
  motives: { gap: spacing.xxs },
  input: {
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    borderRadius: metrics.fieldRadius,
    padding: spacing.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.text,
  },
  error: { color: colors.error },
});
