import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReport } from '../../../factories/security';
import { blockLabel } from '../../../model/services/securityFormat';
import { AppIcon } from '../../components/AppIcon';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { BlockUserDialog } from '../../components/security/BlockUserDialog';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { TopAppBar } from '../../components/ui/TopAppBar';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Denunciar anúncio ou pessoa (Figma 09.03) e a confirmação (09.04). */
export default function ReportScreen() {
  const params = useLocalSearchParams<{ userId?: string; listingId?: string; userName?: string }>();
  const router = useRouter();
  const userId = params.userId || null;
  const listingId = params.listingId || null;
  const firstName = params.userName || null;
  const vm = useReport({ userId, listingId });
  const [blocking, setBlocking] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const title = vm.kind === 'listing' ? 'Denunciar anúncio' : 'Denunciar pessoa';
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/inicio'));

  if (vm.sent) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <TopAppBar title={title} onBack={leave} />
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.brand}>
            Recebemos sua denúncia.
          </Text>
          <Text style={styles.body} accessibilityLiveRegion="polite">
            {blocked
              ? 'A equipe vai analisar o relato. Essa pessoa está bloqueada e os anúncios dela somem para você.'
              : 'A equipe vai analisar o relato. Você também pode bloquear a pessoa para não ver mais os anúncios dela.'}
          </Text>
          <Button
            label={vm.kind === 'listing' ? 'Voltar ao livro' : 'Voltar'}
            onPress={blocked ? () => router.replace('/inicio') : leave}
          />
          {userId && !blocked ? (
            <Button
              label={blockLabel(firstName)}
              variant="text"
              onPress={() => setBlocking(true)}
            />
          ) : null}
        </View>
        <BlockUserDialog
          visible={blocking}
          userId={userId}
          firstName={firstName}
          onCancel={() => setBlocking(false)}
          onBlocked={() => {
            setBlocking(false);
            setBlocked(true);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TopAppBar title={title} onBack={leave} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.question}>
            O que aconteceu?
          </Text>
          <Text style={styles.caption}>
            Quem você denunciou não fica sabendo que foi você. A equipe analisa cada relato.
          </Text>
        </View>

        <View accessibilityRole="radiogroup" accessibilityLabel="Motivo da denúncia">
          {vm.reasons.map((reason) => {
            const selected = vm.reason === reason;
            return (
              <Pressable
                key={reason}
                accessibilityRole="radio"
                accessibilityLabel={reason}
                accessibilityState={{ checked: selected, selected }}
                onPress={() => vm.setReason(reason)}
                style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                  styles.option,
                  pressed && styles.pressed,
                  focused && styles.focused,
                ]}
              >
                <AppIcon
                  name={selected ? 'radioOn' : 'radioOff'}
                  color={selected ? colors.action : colors.onSurfaceVariant}
                />
                <Text style={styles.optionLabel}>{reason}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label="Detalhes (opcional)"
          value={vm.details}
          onChangeText={vm.setDetails}
          maxLength={vm.detailsMax}
          multiline
          numberOfLines={3}
          editable={!vm.submitting}
          placeholder="Pediu pagamento antes do encontro"
        />

        <FormMessage tone="error" message={vm.error} />
      </ScrollView>
      <ActionBar>
        <Button label="Enviar denúncia" onPress={vm.submit} loading={vm.submitting} />
      </ActionBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  intro: { gap: spacing.xs },
  question: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
  },
  caption: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  brand: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.xs,
  },
  pressed: { backgroundColor: colors.pressed },
  optionLabel: { ...typography.bodyLarge, color: colors.onSurface, flex: 1 },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
});
