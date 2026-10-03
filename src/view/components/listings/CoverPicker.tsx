import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { base64ToArrayBuffer } from '../../../model/services/coverBytes';
import type { PickedCover } from '../../../viewmodel/usePublishListingViewModel';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { Button } from '../ui/Button';

/** Acima disto a foto demora demais para subir no 3G de quem está na rua. */
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * A foto do exemplar — opcional (spec 025, passo 3).
 *
 * Converte para bytes aqui, na View, porque é só aqui que existe uma `uri` de
 * arquivo: o Model não conhece React Native (ADR 0012) e receber `ArrayBuffer`
 * o mantém assim.
 */
export function CoverPicker({
  picked,
  currentUrl,
  onPick,
  onClear,
  disabled = false,
}: {
  picked: PickedCover | null;
  /** A capa que já está no anúncio, na edição. */
  currentUrl?: string | null;
  onPick: (cover: PickedCover) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const preview = picked?.previewUri ?? currentUrl ?? null;

  const choose = async () => {
    setError(null);
    setBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Precisamos da sua permissão para abrir as fotos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        base64: true,
      });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return;

      // No aparelho, `fetch` do arquivo local não traz a imagem; o base64 traz.
      const bytes = asset.base64
        ? base64ToArrayBuffer(asset.base64)
        : await (await fetch(asset.uri)).arrayBuffer();
      if (bytes.byteLength > MAX_BYTES) {
        setError('Esta foto é muito grande. Escolha uma de até 5 MB.');
        return;
      }
      onPick({
        previewUri: asset.uri,
        file: {
          filename: asset.fileName ?? 'capa.jpg',
          mimeType: asset.mimeType ?? 'image/jpeg',
          bytes,
        },
      });
    } catch {
      setError('Não conseguimos abrir essa foto. Tente outra.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {preview ? (
        <Image
          source={{ uri: preview }}
          style={styles.preview}
          contentFit="cover"
          accessibilityLabel="Foto do exemplar"
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolher uma foto do exemplar"
          accessibilityHint="Abre as fotos do aparelho"
          disabled={disabled || busy}
          onPress={choose}
          style={({ pressed }) => [styles.empty, pressed && styles.pressed]}
        >
          <AppIcon name="photo" size={spacing.xl} color={colors.secondaryText} />
          <Text style={styles.emptyText}>Sem foto. O anúncio usa uma capa ilustrativa.</Text>
        </Pressable>
      )}

      <View style={styles.actions}>
        <Button
          label={preview ? 'Trocar a foto' : 'Escolher uma foto'}
          variant="secondary"
          loading={busy}
          disabled={disabled}
          onPress={choose}
        />
        {preview ? (
          <Button
            label="Remover a foto"
            variant="text"
            disabled={disabled || busy}
            onPress={onClear}
          />
        ) : null}
      </View>

      {error ? (
        <Text
          style={styles.error}
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Erro: ${error}`}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.disabledBackground,
  },
  empty: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: metrics.cardRadius,
    borderWidth: metrics.borderThin,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
  },
  pressed: { backgroundColor: colors.pressed },
  emptyText: { ...typography.bodyMedium, color: colors.secondaryText, textAlign: 'center' },
  actions: { gap: spacing.xs },
  error: { ...typography.caption, color: colors.error },
});
