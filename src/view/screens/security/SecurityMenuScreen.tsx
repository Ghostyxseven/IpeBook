import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../view/components/ui/Button';
import { colors, metrics, spacing, typography } from '../../../view/theme/nativeTheme';

export default function SecurityMenuScreen() {
  const params = useLocalSearchParams<{ userId?: string; listingId?: string; userName?: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Sua segurança</Text>

        <View style={styles.actions}>
          {params.userId && (
            <Button
              label="Denunciar usuário"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/seguranca/report',
                  params: { userId: params.userId },
                })
              }
            />
          )}

          {params.listingId && (
            <Button
              label="Denunciar anúncio"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/seguranca/report',
                  params: { listingId: params.listingId, userId: params.userId },
                })
              }
            />
          )}

          {params.userId && (
            <Button
              label="Bloquear perfil"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/seguranca/block',
                  params: { userId: params.userId, userName: params.userName },
                })
              }
            />
          )}

          <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
        </View>
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
  title: { ...typography.titleLarge, color: colors.text, marginBottom: spacing.md },
  actions: { gap: spacing.sm },
});
