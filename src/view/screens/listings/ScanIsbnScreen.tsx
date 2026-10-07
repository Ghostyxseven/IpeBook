import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsbnScan } from '../../../factories/isbn';
import type { BookLookup } from '../../../model/entities/BookLookup';
import { AppIcon } from '../../components/AppIcon';
import {
  IsbnCamera,
  IsbnViewfinderPlaceholder,
  useIsbnCameraPermission,
} from '../../components/listings/IsbnCamera';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Ler ISBN (spec 030) pelos quadros do Figma: 04.02 visor, 04.03 livro
 * identificado, 04.17 câmera não permitida e 04.18 ISBN não encontrado.
 *
 * É um estado do Anunciar, não uma rota: a rota desmontaria o formulário e com
 * ele o rascunho já digitado (ver o plano da spec 030).
 */
export function ScanIsbnScreen({
  onUse,
  onClose,
}: {
  /** "Usar estes dados": o livro volta para o formulário. */
  onUse: (book: BookLookup) => void;
  /** Voltar e "Preencher sem ISBN": fecha a leitura sem mexer no rascunho. */
  onClose: () => void;
}) {
  const vm = useIsbnScan();
  const camera = useIsbnCameraPermission();

  // A permissão é pedida uma vez, ao abrir. Negada, a tela vira o quadro 04.17.
  useEffect(() => {
    if (camera.granted === null && camera.canAskAgain) void camera.request();
  }, [camera]);

  useEffect(() => {
    if (camera.granted === false) vm.cameraDenied();
  }, [camera.granted, vm]);

  const retryCamera = () => {
    // Sem poder perguntar de novo, só as Configurações do aparelho resolvem; o
    // botão ainda assim volta ao visor, porque a pessoa pode ter liberado lá.
    if (camera.canAskAgain) void camera.request();
    vm.scanAgain();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={onClose}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.iconButton,
            pressed && styles.iconPressed,
            focused && styles.focused,
          ]}
        >
          <AppIcon name="back" color={colors.onSurface} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.appTitle}>
          Ler ISBN
        </Text>
      </View>

      {vm.status === 'denied' ? (
        <Denied onRetry={retryCamera} onManual={onClose} />
      ) : vm.status === 'not-found' ? (
        <NotFound
          code={vm.code}
          error={vm.error}
          onChange={vm.setCode}
          onSubmit={vm.submitTyped}
          onManual={onClose}
          onScanAgain={vm.scanAgain}
          canScan={camera.granted === true}
        />
      ) : vm.status === 'typing' ? (
        <Typing
          code={vm.code}
          onChange={vm.setCode}
          onSubmit={vm.submitTyped}
          onManual={onClose}
          onScanAgain={vm.scanAgain}
          canScan={camera.granted === true}
        />
      ) : (
        <Scanning vm={vm} camera={camera} onUse={onUse} onManual={onClose} />
      )}
    </SafeAreaView>
  );
}

/** 04.02 Ler ISBN e, por cima dele, 04.03 Livro identificado. */
function Scanning({
  vm,
  camera,
  onUse,
  onManual,
}: {
  vm: ReturnType<typeof useIsbnScan>;
  camera: ReturnType<typeof useIsbnCameraPermission>;
  onUse: (book: BookLookup) => void;
  onManual: () => void;
}) {
  const busy = vm.status === 'looking-up';
  const found = vm.status === 'found' ? vm.book : null;

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          {camera.granted ? (
            <IsbnCamera active={vm.status === 'scanning'} onCode={vm.onBarcode} />
          ) : (
            <IsbnViewfinderPlaceholder />
          )}
          {/* O véu da 04.03 e a espera da consulta usam o mesmo escurecimento. */}
          {found || busy ? <View style={styles.veil} pointerEvents="none" /> : null}
        </View>

        <View style={styles.note} accessibilityLiveRegion="polite">
          <AppIcon name="info" size={18} color={colors.onSurfaceVariant} />
          <Text style={styles.noteText}>
            {busy
              ? 'Consultando o código lido…'
              : 'Mantenha o livro parado e com boa luz. A leitura começa sozinha.'}
          </Text>
        </View>

        {found ? <IdentifiedBook book={found} /> : null}
      </ScrollView>

      <ActionBar>
        {found ? (
          <>
            <Button label="Usar estes dados" onPress={() => onUse(found)} />
            <Button label="Corrigir manualmente" variant="secondary" onPress={onManual} />
          </>
        ) : (
          <>
            <Button
              label="Digitar o ISBN"
              variant="text"
              onPress={vm.typeManually}
              disabled={busy}
            />
            <Button label="Preencher sem ISBN" variant="text" onPress={onManual} />
          </>
        )}
      </ActionBar>
    </>
  );
}

/** A folha da 04.03: selo, título da marca e o cartão com o que foi encontrado. */
function IdentifiedBook({ book }: { book: BookLookup }) {
  return (
    <View style={styles.sheet} accessibilityLiveRegion="polite">
      <View style={styles.badge}>
        <AppIcon name="checkCircle" size={18} color={colors.action} />
        <Text style={styles.badgeText}>Código lido</Text>
      </View>
      <Text accessibilityRole="header" style={styles.brand}>
        Encontramos seu livro.
      </Text>
      <View style={styles.bookCard}>
        <View style={styles.bookCover}>
          <AppIcon name="shelf" size={spacing.xl} color={colors.containerLowest} />
        </View>
        <View style={styles.bookText}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {book.title}
          </Text>
          {book.author ? (
            <Text style={styles.body} numberOfLines={2}>
              {book.author}
            </Text>
          ) : (
            <Text style={styles.body}>Autor não informado pela base</Text>
          )}
          <Text style={styles.confirm}>Confira título e autor</Text>
        </View>
      </View>
    </View>
  );
}

/** 04.02 com o campo no lugar do visor — a saída de quem não tem câmera. */
function Typing(props: {
  code: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onManual: () => void;
  onScanAgain: () => void;
  canScan: boolean;
}) {
  return (
    <IsbnForm
      {...props}
      title="Digite o ISBN do seu livro."
      body="O código tem 10 ou 13 dígitos e fica junto do código de barras, na contracapa."
      submitLabel="Buscar o livro"
    />
  );
}

/** 04.18 ISBN não encontrado. */
function NotFound({
  error,
  ...props
}: {
  code: string;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onManual: () => void;
  onScanAgain: () => void;
  canScan: boolean;
}) {
  return (
    <IsbnForm
      {...props}
      title="Não encontramos esse ISBN."
      body={error ?? 'Confira o código ou informe o título e o autor do seu exemplar.'}
      submitLabel="Buscar de novo"
    />
  );
}

/** O corpo comum da 04.02 digitada e da 04.18: mesma estrutura, outro texto. */
function IsbnForm({
  code,
  title,
  body,
  submitLabel,
  onChange,
  onSubmit,
  onManual,
  onScanAgain,
  canScan,
}: {
  code: string;
  title: string;
  body: string;
  submitLabel: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onManual: () => void;
  onScanAgain: () => void;
  canScan: boolean;
}) {
  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.brandHeadline}>
            {title}
          </Text>
          <Text style={styles.bodyLarge}>{body}</Text>
        </View>
        <TextField
          label="ISBN"
          value={code}
          onChangeText={onChange}
          keyboardType="number-pad"
          autoCapitalize="characters"
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          placeholder="9788522005475"
        />
      </ScrollView>
      <ActionBar>
        <Button label={submitLabel} onPress={onSubmit} />
        {canScan ? (
          <Button label="Ler novamente" variant="secondary" onPress={onScanAgain} />
        ) : null}
        <Button label="Preencher manualmente" variant="text" onPress={onManual} />
      </ActionBar>
    </>
  );
}

/** 04.17 Câmera não permitida. */
function Denied({ onRetry, onManual }: { onRetry: () => void; onManual: () => void }) {
  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.brandHeadline}>
            Precisamos da câmera para ler o ISBN.
          </Text>
          <Text style={styles.bodyLarge}>
            Permita o acesso nas configurações do aparelho ou preencha os dados manualmente.
          </Text>
        </View>
      </ScrollView>
      <ActionBar>
        <Button label="Tentar novamente" onPress={onRetry} />
        <Button label="Preencher manualmente" variant="text" onPress={onManual} />
      </ActionBar>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  iconButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: metrics.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: { backgroundColor: colors.pressed },
  appTitle: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
  },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.scannerVeil,
  },
  note: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
  noteText: { ...typography.bodyMedium, color: colors.onSurfaceVariant, flex: 1 },
  intro: { gap: spacing.xs },
  brandHeadline: { ...typography.brandHeadline, color: colors.onSurface },
  bodyLarge: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  sheet: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.containerLow,
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badgeText: { ...typography.labelLarge, color: colors.action },
  brand: { ...typography.brandTitle, color: colors.onSurface },
  bookCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerHigh,
  },
  bookCover: {
    width: 56,
    height: 78,
    borderRadius: radius.small,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: { flex: 1, gap: spacing.xxs },
  bookTitle: { ...typography.titleMedium, color: colors.onSurface },
  confirm: { ...typography.labelLarge, color: colors.action },
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
