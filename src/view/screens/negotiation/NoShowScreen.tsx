import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookRequestDetail } from '../../../factories/bookRequest';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { TopAppBar } from '../../components/ui/TopAppBar';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/**
 * Não comparecimento (Figma 06.15): o relato vai para a conversa, e daqui a pessoa também
 * reagenda ou pede ajuda (a denúncia da spec 027). Nada muda na negociação sozinho.
 */
export function NoShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = String(id ?? '');
  const vm = useBookRequestDetail(requestId);
  const [details, setDetails] = useState('');
  const leave = () =>
    router.canGoBack() ? router.back() : router.replace(`/negociacoes/${requestId}`);

  if (vm.status !== 'ready' || !vm.request || !vm.listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TopAppBar title="Não comparecimento" onBack={leave} />
        {vm.status === 'loading' ? (
          <LoadingState message="Carregando negociação…" />
        ) : (
          <View style={styles.content}>
            <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const { request, listing, other } = vm;
  const text = details.trim();
  const openChat = () =>
    router.push({
      pathname: '/negociacoes/[id]/conversa',
      params: text ? { id: request.id, draft: text } : { id: request.id },
    });
  const askHelp = () =>
    router.push({
      pathname: '/seguranca/report',
      params: {
        listingId: listing.id,
        ...(other.id ? { userId: other.id } : {}),
        ...(other.name ? { userName: other.name } : {}),
      },
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopAppBar title="Não comparecimento" onBack={leave} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title} accessibilityRole="header">
            O encontro não aconteceu?
          </Text>
          <Text style={styles.body}>
            Conte o que aconteceu. Você pode conversar, reagendar ou pedir ajuda.
          </Text>
          <TextField
            label="Detalhes (opcional)"
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={1000}
            placeholder="Aguardei no local combinado."
            hint="O texto vai para o campo da conversa; você revisa antes de enviar."
          />
          <View style={styles.actions}>
            <Button label="Abrir conversa" onPress={openChat} />
            {request.status === 'accepted' ? (
              <Button
                label="Reagendar"
                variant="text"
                onPress={() => router.push(`/negociacoes/${request.id}/reagendar`)}
              />
            ) : null}
            <Button label="Pedir ajuda" variant="text" onPress={askHelp} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.readingMaxWidth,
    alignSelf: 'center',
  },
  title: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyLarge, color: colors.onSurfaceVariant, marginBottom: spacing.xs },
  actions: { gap: spacing.xs, marginTop: spacing.sm },
});
