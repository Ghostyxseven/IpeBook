import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * O visor da 04.02: fundo escuro, moldura âmbar nos quatro cantos, linha de
 * leitura e o aviso "Centralize o código de barras".
 *
 * Único arquivo do app que importa `expo-camera` (ADR 0026), do mesmo jeito que
 * `CoverPicker` é o único que importa `expo-image-picker`: a câmera é recurso de
 * plataforma, e o resto do app não precisa saber que ela existe.
 */

/** Só EAN-13: o código de barras de livro. Ver ADR 0026. */
const BARCODE_TYPES = ['ean13'] as const;

/**
 * A permissão de câmera, isolada aqui para não espalhar `expo-camera`.
 *
 * `granted` é `null` enquanto a resposta não chegou — estado diferente de
 * "negado", e que a tela usa para não piscar o quadro 04.17 enquanto decide.
 */
export function useIsbnCameraPermission() {
  const [permission, requestPermission] = useCameraPermissions();
  return {
    granted: permission ? permission.granted : null,
    /** `false` quando o sistema não vai mais perguntar: resta as Configurações. */
    canAskAgain: permission ? permission.canAskAgain : true,
    request: requestPermission,
  };
}

export function IsbnCamera({
  active,
  onCode,
}: {
  /** Enquanto `false`, a câmera para de entregar leituras (consulta no ar, ou folha aberta). */
  active: boolean;
  onCode: (value: string) => void;
}) {
  return (
    <View style={styles.viewfinder}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        // `undefined` desliga a leitura; passar uma função que ignora manteria o
        // decodificador rodando a cada quadro sem nenhum proveito.
        onBarcodeScanned={active ? ({ data }) => onCode(data) : undefined}
      />
      <Frame />
    </View>
  );
}

/** O mesmo visor sem câmera: enquanto a permissão é decidida, e na Web sem vídeo. */
export function IsbnViewfinderPlaceholder() {
  return (
    <View style={styles.viewfinder}>
      <Frame />
    </View>
  );
}

/** A moldura do Figma. Decorativa: o texto abaixo é que é lido em voz alta. */
function Frame() {
  return (
    <View style={styles.frame} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={styles.corners}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        <View style={styles.beam} />
      </View>
      <Text style={styles.hint}>Centralize o código de barras</Text>
    </View>
  );
}

/** Mede o quadro de leitura do Figma: 222 × 130 dentro de um visor de 345 × 420. */
const CORNER = 31;
const BORDER = 3;

const styles = StyleSheet.create({
  viewfinder: {
    width: '100%',
    aspectRatio: 345 / 420,
    maxHeight: 420,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.scannerSurface,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corners: { width: 222, height: 130, justifyContent: 'center' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.brandAmber },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER,
    borderLeftWidth: BORDER,
    borderTopLeftRadius: spacing.sm,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER,
    borderRightWidth: BORDER,
    borderTopRightRadius: spacing.sm,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER,
    borderLeftWidth: BORDER,
    borderBottomLeftRadius: spacing.sm,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER,
    borderRightWidth: BORDER,
    borderBottomRightRadius: spacing.sm,
  },
  beam: { height: 2, backgroundColor: colors.brandAmber, marginHorizontal: spacing.md },
  hint: {
    ...typography.titleMedium,
    color: colors.scannerOnSurface,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
