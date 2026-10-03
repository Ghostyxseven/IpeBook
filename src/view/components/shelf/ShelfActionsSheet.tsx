import { useEffect, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MyListing } from '../../../model/entities/Listing';
import { lockedReason } from '../../../model/services/listingFormat';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon, type AppIconName } from '../AppIcon';
import { Button } from '../ui/Button';

/**
 * O que dá para fazer com um livro da estante, aberto ao tocar na linha (Figma 05.01:
 * "Toque em um livro para editar..."). As ações mudam com a situação: um anúncio
 * reservado só mostra o motivo, porque quem manda nele agora é a negociação.
 */
export function ShelfActionsSheet({
  listing,
  busy,
  onClose,
  onOpen,
  onEdit,
  onArchive,
  onRepublish,
  onRemove,
}: {
  listing: MyListing | null;
  busy: boolean;
  onClose: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRepublish: () => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => setConfirming(false), [listing?.id]);

  const available = listing?.status === 'disponivel';
  const archived = listing?.status === 'arquivado';
  const locked = listing ? lockedReason(listing.status) : null;

  return (
    <Modal
      visible={listing !== null}
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.scrim}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar opções"
      />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />
        {listing ? (
          <>
            <Text style={styles.title} accessibilityRole="header" numberOfLines={2}>
              {listing.title}
            </Text>
            {confirming ? (
              <View style={styles.confirm}>
                <Text style={styles.warning} accessibilityLiveRegion="polite">
                  Excluir apaga o anúncio e a foto. Não dá para desfazer.
                </Text>
                <Button label="Sim, excluir" variant="danger" disabled={busy} onPress={onRemove} />
                <Button
                  label="Cancelar"
                  variant="text"
                  disabled={busy}
                  onPress={() => setConfirming(false)}
                />
              </View>
            ) : (
              <View>
                {locked ? <Text style={styles.locked}>{locked}</Text> : null}
                <Action icon="bookmark" label="Ver anúncio" onPress={onOpen} disabled={busy} />
                {available ? (
                  <Action icon="edit" label="Editar" onPress={onEdit} disabled={busy} />
                ) : null}
                {available ? (
                  <Action icon="archive" label="Arquivar" onPress={onArchive} disabled={busy} />
                ) : null}
                {archived ? (
                  <Action
                    icon="unarchive"
                    label="Republicar"
                    onPress={onRepublish}
                    disabled={busy}
                  />
                ) : null}
                {available || archived ? (
                  <Action
                    icon="delete"
                    label="Excluir"
                    danger
                    onPress={() => setConfirming(true)}
                    disabled={busy}
                  />
                ) : null}
              </View>
            )}
          </>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

function Action({
  icon,
  label,
  onPress,
  disabled,
  danger = false,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  const tint = danger ? colors.error : colors.onSurface;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <AppIcon name={icon} color={danger ? colors.error : colors.onSurfaceVariant} />
      <Text style={[styles.actionLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

/** Quem pediu menos movimento no aparelho vê a folha aparecer sem deslizar. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => active && setReduced(value));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.32)' },
  sheet: {
    backgroundColor: colors.containerLow,
    borderTopLeftRadius: radius.extraLarge,
    borderTopRightRadius: radius.extraLarge,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.onSurfaceVariant,
    opacity: 0.4,
    marginVertical: spacing.md,
  },
  title: { ...typography.titleMedium, color: colors.onSurface, marginBottom: spacing.xs },
  locked: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.containerHigh,
    borderRadius: radius.small,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  action: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  actionLabel: { ...typography.bodyLarge },
  confirm: { gap: spacing.xs },
  warning: { ...typography.bodyMedium, color: colors.error },
});
