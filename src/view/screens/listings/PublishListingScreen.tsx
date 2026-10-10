import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePublishListing } from '../../../factories/listings';
import type { DraftRecord } from '../../../model/entities/Draft';
import type { MyListing } from '../../../model/entities/Listing';
import {
  conditionLabels,
  modalityLabels,
  modalitySummary,
} from '../../../model/services/catalogFormat';
import { draftSupporting, draftTitle } from '../../../model/services/draftSummary';
import { categories } from '../../../model/services/categories';
import { conditions, modalities } from '../../../model/services/listingValidation';
import type { PublishStep } from '../../../viewmodel/usePublishListingViewModel';
import { AppIcon } from '../../components/AppIcon';
import { ListingCover } from '../../components/catalog/ListingCover';
import { ChoiceChips } from '../../components/listings/ChoiceChips';
import { pickCoverImage } from '../../components/listings/CoverPicker';
import { SegmentedButtons } from '../../components/listings/SegmentedButtons';
import { ActionBar } from '../../components/negotiation/ActionBar';
import { ScanIsbnScreen } from './ScanIsbnScreen';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormMessage } from '../../components/ui/FormMessage';
import { TextField } from '../../components/ui/TextField';
import { MeetingPointField } from '../../components/maps/MeetingPointField';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Título da barra e nome da etapa, como nos quadros 04.01, 04.04 e 04.05. */
const stepTitles: Record<PublishStep, { title: string; name: string }> = {
  livro: { title: 'Anunciar livro', name: 'Livro' },
  fotos: { title: 'Fotos do livro', name: 'Fotos' },
  detalhes: { title: 'Detalhes do livro', name: 'Detalhes' },
};

/** O limite que o Figma mostra no contador da descrição. */
const DESCRIPTION_LIMIT = 280;

/** Id provisório só para a capa ilustrativa escolher a cor enquanto o anúncio não existe. */
const PREVIEW_ID = 'novo-anuncio';

/**
 * Anunciar livro (spec 025) pelos quadros do Figma: 04.01 livro e modalidade,
 * 04.04 fotos, 04.05 detalhes e 04.07 anúncio publicado.
 */
export function PublishListingScreen() {
  const router = useRouter();
  const vm = usePublishListing();
  const { rascunho } = useLocalSearchParams<{ rascunho?: string }>();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // 04.12 · Retomar rascunho. Uma vez por id: `resumeDraft` reescreve o
  // formulário, e repetir isso a cada render apagaria o que a pessoa digitar.
  const resumed = useRef<string | null>(null);
  const resumeDraft = vm.resumeDraft;
  useEffect(() => {
    const id = rascunho ? String(rascunho) : null;
    if (!id || resumed.current === id) return;
    resumed.current = id;
    void resumeDraft(id);
  }, [rascunho, resumeDraft]);

  /** Sair com algo preenchido pergunta antes (04.13); sem nada, sai direto. */
  const leave = () => (vm.hasContent ? setLeaving(true) : router.back());

  const choosePhoto = async () => {
    setPhotoError(null);
    setPicking(true);
    const result = await pickCoverImage();
    setPicking(false);
    if (!result) return;
    if ('error' in result) setPhotoError(result.error);
    else vm.pickCover(result);
  };

  if (vm.published) {
    return <Published listing={vm.published} />;
  }

  // 04.14 · Rascunho salvo
  if (vm.savedDraft) {
    return <DraftSaved record={vm.savedDraft} onContinue={vm.clearSavedDraft} />;
  }

  // 04.19 · Falha ao enviar fotos
  if (vm.uploadFailed) {
    return (
      <UploadFailed
        busy={vm.submitting}
        onRetry={vm.submit}
        onSaveDraft={vm.saveDraft}
        onBack={vm.dismissUploadFailure}
      />
    );
  }

  // 04.02 a 04.18: a leitura ocupa a tela e devolve o formulário intacto.
  if (vm.scanning) {
    return <ScanIsbnScreen onUse={vm.applyLookup} onClose={vm.closeScanner} />;
  }

  const { title, name } = stepTitles[vm.step];
  const errors = vm.stepErrors(vm.step);
  const busy = vm.submitting || picking;
  const preview = { id: PREVIEW_ID, title: vm.draft.title || 'Seu livro', author: vm.draft.author };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.isFirst ? 'Fechar' : 'Voltar'}
          onPress={() => (vm.isFirst ? leave() : vm.back())}
          disabled={vm.submitting}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.iconButton,
            pressed && styles.iconPressed,
            focused && styles.focused,
          ]}
        >
          <AppIcon name="back" color={colors.onSurface} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.appTitle}>
          {title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {vm.step !== 'fotos' ? (
          <View
            style={styles.progress}
            accessible
            accessibilityLabel={`Etapa ${vm.stepNumber} de ${vm.stepCount}: ${name}`}
          >
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{`Etapa ${vm.stepNumber} de ${vm.stepCount}`}</Text>
              <Text style={styles.progressText}>{name}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(vm.stepNumber / vm.stepCount) * 100}%` }]} />
            </View>
          </View>
        ) : null}

        {vm.step === 'livro' ? (
          <>
            {/* 04.01: o atalho fica acima dos campos, e é só um atalho (spec 030). */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ler ISBN com a câmera"
              accessibilityHint="Preenche título e autor a partir do código de barras"
              onPress={vm.openScanner}
              disabled={busy}
              style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                styles.isbnLink,
                pressed && styles.iconPressed,
                focused && styles.focused,
              ]}
            >
              <AppIcon name="search" color={colors.actionDeep} />
              <View style={styles.flex}>
                <Text style={styles.isbnTitle}>Ler ISBN com a câmera</Text>
                <Text style={styles.caption}>Preenche título e autor</Text>
              </View>
              <AppIcon name="chevronRight" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
            <SegmentedButtons
              label="Como você quer anunciar"
              options={modalities.map((value) => ({ value, label: modalityLabels[value] }))}
              value={vm.draft.modality}
              onChange={vm.setModality}
              disabled={vm.submitting}
            />
            <View style={styles.bookRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={vm.cover ? 'Trocar a foto da capa' : 'Foto da capa'}
                accessibilityHint="Abre as fotos do aparelho"
                onPress={choosePhoto}
                disabled={busy}
                style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                  styles.photoTile,
                  pressed && styles.iconPressed,
                  focused && styles.focused,
                ]}
              >
                {vm.cover ? (
                  <Image
                    source={{ uri: vm.cover.previewUri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    accessible={false}
                  />
                ) : (
                  <>
                    <AppIcon name="add" color={colors.onSurface} />
                    <Text style={styles.photoLabel}>Foto da capa</Text>
                  </>
                )}
              </Pressable>
              <View style={styles.bookFields}>
                <TextField
                  label="Título"
                  value={vm.draft.title}
                  onChangeText={(value) => vm.setText('title', value)}
                  error={errors.title}
                  editable={!vm.submitting}
                  autoCapitalize="sentences"
                  returnKeyType="next"
                />
                <TextField
                  label="Autor"
                  value={vm.draft.author}
                  onChangeText={(value) => vm.setText('author', value)}
                  error={errors.author}
                  editable={!vm.submitting}
                  autoCapitalize="words"
                />
              </View>
            </View>
            {photoError ? <Text style={styles.error}>{photoError}</Text> : null}

            {vm.draft.modality === 'sale' ? (
              <TextField
                label="Preço (R$)"
                value={vm.priceInput}
                onChangeText={vm.setPriceInput}
                error={errors.priceCents}
                editable={!vm.submitting}
                keyboardType="decimal-pad"
                placeholder="25,00"
              />
            ) : null}
            {vm.draft.modality === 'trade' ? (
              <TextField
                label="O que você aceita em troca"
                value={vm.draft.tradeTerms ?? ''}
                onChangeText={(value) => vm.setText('tradeTerms', value)}
                error={errors.tradeTerms}
                editable={!vm.submitting}
                multiline
                numberOfLines={3}
                placeholder="Qualquer livro de ficção científica"
              />
            ) : null}

            <View style={styles.note}>
              <AppIcon name="info" size={18} color={colors.onSurfaceVariant} />
              <Text style={styles.noteText}>
                {vm.draft.modality === 'donation'
                  ? 'Doação é gratuita: ninguém paga nada. Conservação e bairro vêm na próxima etapa.'
                  : 'Foto leve, com boa luz. Conservação e bairro vêm na próxima etapa.'}
              </Text>
            </View>
          </>
        ) : null}

        {vm.step === 'fotos' ? (
          <>
            <View style={styles.intro}>
              <Text accessibilityRole="header" style={styles.brand}>
                Mostre seu livro.
              </Text>
              <Text style={styles.body}>
                Uma foto nítida ajuda a conhecer o estado do exemplar.
              </Text>
            </View>
            <View style={styles.photoPreview}>
              {vm.cover ? (
                <Image
                  source={{ uri: vm.cover.previewUri }}
                  style={styles.photoLarge}
                  contentFit="cover"
                  accessibilityLabel="Foto escolhida da capa"
                />
              ) : (
                <ListingCover listing={{ ...preview, coverUrl: null }} variant="publish" />
              )}
            </View>
            {!vm.cover ? (
              <Text style={styles.caption}>
                Capa ilustrativa: a foto real substitui esta prévia.
              </Text>
            ) : null}
            {photoError ? <Text style={styles.error}>{photoError}</Text> : null}
            <View style={styles.tip}>
              <Text style={styles.tipTitle}>Dica de foto</Text>
              <Text style={styles.body}>Luz natural, fundo liso e a capa inteira no quadro.</Text>
            </View>
          </>
        ) : null}

        {vm.step === 'detalhes' ? (
          <>
            <ChoiceChips
              label="Conservação"
              options={conditions.map((value) => ({ value, label: conditionLabels[value] }))}
              value={vm.draft.condition}
              onChange={vm.setCondition}
              error={errors.condition}
            />
            <ChoiceChips
              label="Categoria"
              options={categories.map((value) => ({ value, label: value }))}
              value={vm.draft.category || null}
              onChange={vm.setCategory}
              error={errors.category}
            />
            <View>
              <TextField
                label="Descrição"
                value={vm.draft.description ?? ''}
                onChangeText={(value) => vm.setText('description', value)}
                editable={!vm.submitting}
                multiline
                numberOfLines={3}
                maxLength={DESCRIPTION_LIMIT}
                placeholder="Marcas leves de uso, páginas completas."
              />
              <Text style={styles.counter}>
                {`${(vm.draft.description ?? '').length}/${DESCRIPTION_LIMIT}`}
              </Text>
            </View>
            <TextField
              label="Bairro para retirada"
              value={vm.draft.neighborhood ?? ''}
              onChangeText={(value) => vm.setText('neighborhood', value)}
              editable={!vm.submitting}
              autoCapitalize="words"
              placeholder="Centro"
              hint="O bairro aparece no anúncio. Se você marcar um ponto público abaixo, ele também aparecerá no mapa."
            />
            <MeetingPointField
              value={vm.draft.meetingPoint}
              onChange={vm.setMeetingPoint}
              disabled={vm.submitting}
              publicListing
            />
          </>
        ) : null}

        <FormMessage tone="error" message={vm.error} />
      </ScrollView>

      <ActionBar>
        {vm.step === 'livro' ? (
          <Button label="Continuar" onPress={vm.next} disabled={busy} />
        ) : null}
        {vm.step === 'fotos' ? (
          <>
            <Button
              label={vm.cover ? 'Usar esta foto' : 'Continuar sem foto'}
              onPress={vm.next}
              disabled={busy}
            />
            <Button
              label={vm.cover ? 'Escolher outra foto' : 'Escolher foto'}
              variant="text"
              onPress={choosePhoto}
              loading={picking}
              disabled={vm.submitting}
            />
          </>
        ) : null}
        {vm.step === 'detalhes' ? (
          <Button
            label="Publicar anúncio"
            onPress={vm.submit}
            loading={vm.submitting}
            disabled={picking}
          />
        ) : null}
      </ActionBar>

      {/* 04.13 · Salvar para depois? */}
      <ConfirmDialog
        visible={leaving}
        title="Salvar para depois?"
        message="Guarde este anúncio como rascunho e continue quando quiser. Ele ainda não será publicado."
        confirmLabel="Salvar"
        busy={vm.submitting}
        error={vm.draftError}
        onCancel={() => setLeaving(false)}
        onConfirm={async () => {
          await vm.saveDraft();
          setLeaving(false);
        }}
      />
    </SafeAreaView>
  );
}

/**
 * 04.19 · Falha ao enviar fotos.
 *
 * Existe porque a perda aqui é assimétrica: o texto do anúncio está todo
 * digitado e só a foto não subiu. A tela diz isso ("as informações continuam
 * guardadas") e oferece as duas saídas — tentar de novo, ou guardar como
 * rascunho e resolver a internet depois.
 */
function UploadFailed({
  busy,
  onRetry,
  onSaveDraft,
  onBack,
}: {
  busy: boolean;
  onRetry: () => void;
  onSaveDraft: () => void;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={onBack}
          disabled={busy}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.iconButton,
            pressed && styles.iconPressed,
            focused && styles.focused,
          ]}
        >
          <AppIcon name="back" color={colors.onSurface} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.appTitle}>
          Fotos do livro
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.brand}>
            Sua foto não foi enviada.
          </Text>
          <Text style={styles.body}>
            Confira sua conexão. As informações do anúncio continuam guardadas.
          </Text>
        </View>
      </ScrollView>
      <ActionBar>
        <Button label="Tentar novamente" onPress={onRetry} loading={busy} />
        <Button label="Salvar rascunho" variant="text" onPress={onSaveDraft} disabled={busy} />
      </ActionBar>
    </SafeAreaView>
  );
}

/** 04.14 · Rascunho salvo: o que foi guardado e para onde ir em seguida. */
function DraftSaved({ record, onContinue }: { record: DraftRecord; onContinue: () => void }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={[styles.content, styles.doneContent]}>
        <View accessibilityRole="header" accessible accessibilityLiveRegion="polite">
          <Text style={styles.brand}>Seu anúncio pode esperar.</Text>
        </View>
        <Text style={styles.body}>
          O livro ficou nos seus rascunhos. Retome quando estiver pronto.
        </Text>
        <View style={styles.draftRow}>
          <View style={styles.flex}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {draftTitle(record)}
            </Text>
            <Text style={styles.body} numberOfLines={2}>
              {draftSupporting(record)}
            </Text>
          </View>
        </View>
      </ScrollView>
      <ActionBar>
        <Button label="Continuar edição" onPress={onContinue} />
        <Button
          label="Ver rascunhos"
          variant="secondary"
          onPress={() => router.replace('/anunciar/rascunhos')}
        />
        <Button
          label="Voltar à estante"
          variant="text"
          onPress={() => router.replace('/estante')}
        />
      </ActionBar>
    </SafeAreaView>
  );
}

/** 04.07 Anúncio publicado: confirmação, prévia do anúncio e próximos passos. */
function Published({ listing }: { listing: MyListing }) {
  const router = useRouter();
  const share = () => {
    Share.share({ message: `"${listing.title}" está no IpêBook, em Piripiri.` }).catch(
      () => undefined,
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={[styles.content, styles.doneContent]}>
        <View style={styles.doneIcon}>
          <AppIcon name="check" size={spacing.xl} color={colors.containerLowest} />
        </View>
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel="Seu livro ganhou um novo começo."
        >
          <Text style={styles.brand}>Seu livro ganhou</Text>
          <View style={styles.highlight}>
            <Text style={styles.brand}>um novo começo.</Text>
          </View>
        </View>
        <Text style={styles.body}>O anúncio já aparece para leitores de Piripiri.</Text>

        <View style={styles.previewRow}>
          <ListingCover listing={listing} variant="row" />
          <View style={styles.previewText}>
            <Text style={styles.overline}>{modalitySummary(listing)}</Text>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {listing.title}
            </Text>
            <Text style={styles.body} numberOfLines={1}>
              {listing.author}
            </Text>
          </View>
        </View>

        <View style={styles.nextSteps}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Próximos passos
          </Text>
          <NextStep
            number={1}
            title="Espere o primeiro contato"
            text="Você recebe uma notificação quando alguém se interessar."
          />
          <NextStep
            number={2}
            title="Combine em local público"
            text="Escolham juntos o ponto, o dia e o horário."
          />
        </View>
      </ScrollView>

      <ActionBar>
        <View style={styles.doneActions}>
          <View style={styles.flex}>
            <Button label="Compartilhar" variant="secondary" onPress={share} />
          </View>
          <View style={styles.flex}>
            <Button label="Ver estante" onPress={() => router.replace('/estante')} />
          </View>
        </View>
        <Button label="Voltar ao início" variant="text" onPress={() => router.replace('/inicio')} />
      </ActionBar>
    </SafeAreaView>
  );
}

function NextStep({ number, title, text }: { number: number; title: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.body}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
  progress: { gap: spacing.xs, marginBottom: spacing.xs },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { ...typography.labelLarge, color: colors.onSurfaceVariant },
  track: {
    height: spacing.xxs,
    borderRadius: spacing.xxs / 2,
    backgroundColor: colors.soft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: spacing.xxs / 2, backgroundColor: colors.action },
  isbnLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  isbnTitle: { ...typography.bodyLarge, color: colors.onSurface },
  draftRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  bookRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  photoTile: {
    width: 92,
    height: 130,
    marginTop: spacing.xs,
    borderRadius: radius.medium,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  photoLabel: { ...typography.labelMedium, color: colors.actionDeep, textAlign: 'center' },
  bookFields: { flex: 1, gap: spacing.xs },
  note: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
  noteText: { ...typography.bodyMedium, color: colors.onSurfaceVariant, flex: 1 },
  intro: { gap: spacing.xs },
  brand: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  caption: { ...typography.caption, color: colors.onSurfaceVariant },
  photoPreview: { alignItems: 'center' },
  photoLarge: {
    width: 176,
    aspectRatio: 96 / 136,
    borderRadius: radius.medium,
    backgroundColor: colors.disabledBackground,
  },
  tip: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  tipTitle: { ...typography.titleMedium, color: colors.onSurface },
  counter: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
    marginTop: spacing.xxs,
  },
  error: { ...typography.caption, color: colors.error },
  doneContent: { paddingTop: spacing.xl, gap: spacing.lg },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.medium,
    backgroundColor: colors.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    alignSelf: 'flex-start',
    backgroundColor: colors.highlight,
    borderRadius: radius.small,
    paddingHorizontal: spacing.xxs,
    marginLeft: -spacing.xxs,
  },
  previewRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  previewText: { flex: 1, gap: spacing.xxs },
  overline: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  previewTitle: { ...typography.bodyLarge, color: colors.onSurface },
  nextSteps: { gap: spacing.md },
  sectionTitle: { ...typography.titleMedium, color: colors.onSurface },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNumber: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: spacing.xl / 2,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { ...typography.labelLarge, color: colors.actionDeep },
  stepTitle: { ...typography.bodyLarge, color: colors.onSurface },
  doneActions: { flexDirection: 'row', gap: spacing.sm },
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
