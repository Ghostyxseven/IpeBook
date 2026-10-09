import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Listing } from '../../../model/entities/Listing';
import { conditionLabels } from '../../../model/services/catalogFormat';
import { AppIcon } from '../AppIcon';
import { ListingCover } from '../catalog/ListingCover';
import { EmptyState } from '../feedback/EmptyState';
import { ErrorState } from '../feedback/ErrorState';
import { LoadingState } from '../feedback/LoadingState';
import { FormMessage } from '../ui/FormMessage';
import { Button } from '../ui/Button';
import { colors, metrics, opacity, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Contraproposta (Figma 06.19): o dono pede outro livro da estante de quem propôs.
 *
 * A escolha é de um livro só, por isso cada linha é um `radio` — o leitor de tela não
 * deve sugerir seleção múltipla. O envio fica desligado até haver escolha.
 */
export function CounterOfferSheet({
  visible,
  status,
  shelf,
  otherName,
  listingTitle,
  selected,
  onSelect,
  onSubmit,
  onClose,
  onRetry,
  submitting,
  error,
}: {
  visible: boolean;
  status: 'idle' | 'loading' | 'ready' | 'error';
  shelf: Listing[];
  otherName: string;
  listingTitle: string;
  selected: string | null;
  onSelect: (listingId: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  onRetry: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReducedMotion(value))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return (
    <Modal
      visible={visible}
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.bar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={onClose}
            disabled={submitting}
            accessibilityState={{ disabled: submitting }}
            style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
              styles.close,
              pressed && styles.rowPressed,
              focused && styles.focused,
            ]}
          >
            <AppIcon name="close" color={colors.onSurface} />
          </Pressable>
          <Text style={styles.barTitle} accessibilityRole="header">
            Contraproposta
          </Text>
        </View>

        {status === 'loading' ? (
          <LoadingState message="Carregando a estante…" />
        ) : status === 'error' ? (
          <View style={styles.content}>
            <ErrorState message="Não conseguimos abrir a estante agora." onRetry={onRetry} />
          </View>
        ) : shelf.length === 0 ? (
          <View style={styles.content}>
            <EmptyState
              title="Nenhum outro livro"
              message={`${otherName} não tem outro livro de troca disponível no momento.`}
              actionLabel="Voltar à proposta"
              onAction={onClose}
            />
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.question} accessibilityRole="header">
                {`O que você pede a ${otherName} por ${listingTitle}?`}
              </Text>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Livros disponíveis para contraproposta"
              >
                {shelf.map((listing) => {
                  const chosen = selected === listing.id;
                  return (
                    <Pressable
                      key={listing.id}
                      accessibilityRole="radio"
                      aria-checked={chosen}
                      accessibilityState={{ checked: chosen, disabled: submitting }}
                      disabled={submitting}
                      accessibilityLabel={`${listing.title}, ${listing.author}, ${conditionLabels[listing.condition]}`}
                      onPress={() => onSelect(listing.id)}
                      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                        styles.row,
                        focused && styles.focused,
                        chosen && styles.rowChosen,
                        pressed && styles.rowPressed,
                      ]}
                    >
                      <ListingCover listing={listing} variant="row" />
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle} numberOfLines={2}>
                          {listing.title}
                        </Text>
                        <Text style={styles.rowBody} numberOfLines={1}>
                          {`${listing.author} · ${conditionLabels[listing.condition]}`}
                        </Text>
                      </View>
                      {/* A marca repete o estado que o leitor de tela já anuncia. */}
                      {chosen ? <AppIcon name="check" color={colors.action} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.note}>
                {`${otherName} recebe a contraproposta e pode aceitar ou recusar.`}
              </Text>
            </ScrollView>
            <View style={styles.actions}>
              <FormMessage tone="error" message={error} />
              <Button
                label="Enviar contraproposta"
                disabled={!selected}
                loading={submitting}
                onPress={onSubmit}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  bar: {
    minHeight: metrics.controlHeight + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxs,
  },
  close: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: { ...typography.titleMedium, color: colors.onSurface },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  question: { ...typography.titleMedium, color: colors.onSurface, marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: metrics.touchTarget,
    padding: spacing.xs,
    borderRadius: radius.medium,
    borderWidth: metrics.borderThin,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.xs,
  },
  rowChosen: { borderColor: colors.action, backgroundColor: colors.selected },
  rowPressed: { opacity: opacity.high },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    } as ViewStyle,
    default: {},
  }),
  rowText: { flex: 1, gap: spacing.xxs },
  rowTitle: { ...typography.bodyLarge, color: colors.onSurface },
  rowBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  note: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  actions: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
});
