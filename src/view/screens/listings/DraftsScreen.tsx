import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrafts } from '../../../factories/listings';
import type { DraftRecord } from '../../../model/entities/Draft';
import { draftSupporting, draftTitle } from '../../../model/services/draftSummary';
import { AppIcon } from '../../components/AppIcon';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Rascunhos (spec 032): quadros 04.11 lista, 04.15 descartar e 04.16 vazio.
 *
 * Os três são estados da mesma tela — a confirmação do 04.15 é um diálogo por
 * cima da lista, exatamente como no Figma.
 */
export function DraftsScreen() {
  const router = useRouter();
  const vm = useDrafts();
  const [selected, setSelected] = useState<string | null>(null);
  const [discarding, setDiscarding] = useState<DraftRecord | null>(null);

  if (vm.status === 'loading') {
    return (
      <View style={styles.screen}>
        <LoadingState message="Carregando rascunhos…" />
      </View>
    );
  }

  if (vm.status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        </View>
      </SafeAreaView>
    );
  }

  // 04.16 · Rascunhos · vazio
  if (vm.drafts.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.brand}>
            Nenhum rascunho salvo
          </Text>
          <Text style={styles.body}>
            Salve um anúncio durante o preenchimento e continue quando quiser.
          </Text>
          <View style={styles.actions}>
            <Button label="Anunciar um livro" onPress={() => router.replace('/anunciar')} />
            <Button
              label="Voltar à estante"
              variant="text"
              onPress={() => router.replace('/estante')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = vm.drafts.find((record) => record.id === selected) ?? vm.drafts[0];

  // 04.11 · Rascunhos (com o diálogo 04.15 por cima, quando pedido)
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.brand}>
          Sua ideia está guardada.
        </Text>
        <Text style={styles.body}>
          Continue de onde parou. Seus rascunhos ainda não aparecem no catálogo.
        </Text>

        <FormMessage tone="error" message={vm.actionError} />

        <View style={styles.list}>
          {vm.drafts.map((record) => {
            const chosen = record.id === current?.id;
            return (
              <Pressable
                key={record.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: chosen, checked: chosen }}
                accessibilityLabel={`${draftTitle(record)}. ${draftSupporting(record)}`}
                accessibilityHint="Escolhe este rascunho"
                onPress={() => setSelected(record.id)}
                style={({ pressed }) => [
                  styles.row,
                  chosen && styles.rowChosen,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {draftTitle(record)}
                  </Text>
                  <Text style={styles.body} numberOfLines={2}>
                    {draftSupporting(record)}
                  </Text>
                </View>
                <AppIcon
                  name={chosen ? 'checkCircle' : 'chevronRight'}
                  color={chosen ? colors.action : colors.onSurfaceVariant}
                />
              </Pressable>
            );
          })}
        </View>

        {/* A foto não entra no rascunho (ADR 0030), e é melhor dizer antes. */}
        <View style={styles.note}>
          <AppIcon name="info" size={18} color={colors.onSurfaceVariant} />
          <Text style={styles.noteText}>
            O rascunho guarda o texto. A foto é escolhida de novo ao retomar.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Retomar anúncio"
            disabled={!current || vm.discarding}
            onPress={() =>
              current && router.replace({ pathname: '/anunciar', params: { rascunho: current.id } })
            }
          />
          <Button
            label="Descartar rascunho"
            variant="text"
            disabled={!current || vm.discarding}
            onPress={() => current && setDiscarding(current)}
          />
          <Button
            label="Criar outro anúncio"
            variant="secondary"
            disabled={vm.discarding}
            onPress={() => router.replace('/anunciar')}
          />
        </View>
      </ScrollView>

      {/* 04.15 · Descartar rascunho? */}
      <ConfirmDialog
        visible={discarding !== null}
        title="Descartar rascunho?"
        message="As informações deste rascunho serão apagadas. Esta ação não pode ser desfeita."
        confirmLabel="Descartar"
        destructive
        busy={vm.discarding}
        onCancel={() => setDiscarding(null)}
        onConfirm={async () => {
          const target = discarding;
          setDiscarding(null);
          if (!target) return;
          setSelected(null);
          await vm.discard(target.id);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.readingMaxWidth,
    alignSelf: 'center',
  },
  brand: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  list: { gap: spacing.xxs },
  row: {
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.medium,
  },
  rowChosen: { backgroundColor: colors.containerLow },
  rowPressed: { backgroundColor: colors.pressed },
  rowText: { flex: 1, gap: spacing.xxs },
  rowTitle: { ...typography.bodyLarge, color: colors.onSurface },
  note: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
  noteText: { ...typography.bodyMedium, color: colors.onSurfaceVariant, flex: 1 },
  actions: { gap: spacing.xs, paddingTop: spacing.xs },
});
