import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePublishListing } from '../../../factories/listings';
import { conditionLabels, modalityLabels } from '../../../model/services/catalogFormat';
import { modalityHighlight } from '../../../model/services/listingFormat';
import { CoverPicker } from '../../components/listings/CoverPicker';
import { BookFields, ModalityFields } from '../../components/listings/ListingFields';
import { ListingStepper } from '../../components/listings/ListingStepper';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

const titles = {
  book: 'Sobre o livro',
  modality: 'Como você quer anunciar',
  cover: 'Uma foto do exemplar',
  review: 'Confira antes de publicar',
} as const;

/** Publicar anúncio (spec 025): dados → modalidade → foto → revisar → publicar. */
export function PublishListingScreen() {
  const router = useRouter();
  const vm = usePublishListing();

  if (vm.published) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.done}>
          <Text accessibilityRole="header" style={styles.doneTitle}>
            Anúncio publicado
          </Text>
          <Text style={styles.doneText}>
            {`"${vm.published.title}" já aparece para quem procura livros.`}
          </Text>
          <Button label="Ver na minha estante" onPress={() => router.replace('/estante')} />
          <Button
            label="Voltar ao início"
            variant="text"
            onPress={() => router.replace('/inicio')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const bookErrors = vm.errorsOf('book');
  const modalityErrors = vm.errorsOf('modality');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ListingStepper current={vm.stepNumber} total={vm.stepCount} title={titles[vm.step]} />

        {vm.step === 'book' ? (
          <BookFields
            draft={vm.draft}
            errors={bookErrors}
            onText={(field, value) => vm.setText(field, value)}
            onCategory={vm.setCategory}
            onCondition={vm.setCondition}
            disabled={vm.submitting}
          />
        ) : null}

        {vm.step === 'modality' ? (
          <ModalityFields
            modality={vm.draft.modality}
            priceInput={vm.priceInput}
            tradeTerms={vm.draft.tradeTerms}
            errors={modalityErrors}
            onModality={vm.setModality}
            onPrice={vm.setPriceInput}
            onTerms={(value) => vm.setText('tradeTerms', value)}
            disabled={vm.submitting}
          />
        ) : null}

        {vm.step === 'cover' ? (
          <CoverPicker
            picked={vm.cover}
            onPick={vm.pickCover}
            onClear={vm.clearCover}
            disabled={vm.submitting}
          />
        ) : null}

        {vm.step === 'review' ? (
          <View style={styles.review}>
            <Review
              label="Livro"
              value={`${vm.draft.title} — ${vm.draft.author}`}
              onEdit={() => vm.goTo('book')}
            />
            <Review label="Categoria" value={vm.draft.category} onEdit={() => vm.goTo('book')} />
            <Review
              label="Estado"
              value={conditionLabels[vm.draft.condition]}
              onEdit={() => vm.goTo('book')}
            />
            <Review
              label={modalityLabels[vm.draft.modality]}
              value={modalityHighlight(vm.draft) || '—'}
              onEdit={() => vm.goTo('modality')}
            />
            {vm.draft.tradeTerms ? (
              <Review
                label="Aceita em troca"
                value={vm.draft.tradeTerms}
                onEdit={() => vm.goTo('modality')}
              />
            ) : null}
            <Review
              label="Foto"
              value={vm.cover ? 'Escolhida' : 'Sem foto — usa a capa ilustrativa'}
              onEdit={() => vm.goTo('cover')}
            />
          </View>
        ) : null}

        <FormMessage tone="error" message={vm.error} />

        <View style={styles.actions}>
          {vm.isLast ? (
            <Button label="Publicar anúncio" onPress={vm.submit} loading={vm.submitting} />
          ) : (
            <Button label="Continuar" onPress={vm.next} disabled={vm.submitting} />
          )}
          <Button
            label={vm.isFirst ? 'Cancelar' : 'Voltar'}
            variant="text"
            disabled={vm.submitting}
            onPress={() => (vm.isFirst ? router.back() : vm.back())}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Uma linha da revisão, com o atalho para voltar e corrigir aquele passo. */
function Review({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewText}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
      </View>
      <Button
        label="Alterar"
        variant="text"
        onPress={onEdit}
        accessibilityHint={`Volta para alterar ${label.toLowerCase()}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.lg,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  actions: { gap: spacing.xs },
  review: { gap: spacing.xs },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: metrics.borderThin,
    borderBottomColor: colors.disabledBackground,
  },
  reviewText: { flex: 1, gap: spacing.xxs },
  reviewLabel: { ...typography.labelMedium, color: colors.secondaryText },
  reviewValue: { ...typography.bodyLarge, color: colors.text },
  done: {
    flex: 1,
    justifyContent: 'center',
    padding: metrics.pagePadding,
    gap: spacing.md,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  doneTitle: { ...typography.titleLarge, color: colors.text },
  doneText: { ...typography.bodyLarge, color: colors.secondaryText },
});
