import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEditListing } from '../../../factories/listings';
import { CoverPicker } from '../../components/listings/CoverPicker';
import { BookFields, ModalityFields } from '../../components/listings/ListingFields';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { MeetingPointField } from '../../components/maps/MeetingPointField';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Editar anúncio (spec 025, Figma 38 e 40): o mesmo formulário, já preenchido. */
export function EditListingScreen({ id }: { id: string }) {
  const router = useRouter();
  const vm = useEditListing(id);

  if (vm.status === 'loading') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <LoadingState message="Carregando o anúncio…" />
      </SafeAreaView>
    );
  }

  if (vm.status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <ErrorState
          message={vm.loadError ?? 'Não conseguimos abrir este anúncio.'}
          onRetry={vm.retry}
        />
      </SafeAreaView>
    );
  }

  // 04.06 · Revise o anúncio: com campo recusado, a tela passa a se chamar pelo
  // que está acontecendo. "Editar anúncio" não diz à pessoa que falta corrigir.
  const bookErrors = vm.errorsOf('book');
  const modalityErrors = vm.errorsOf('modality');
  const reviewing = Object.keys(bookErrors).length + Object.keys(modalityErrors).length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          {reviewing ? 'Revise o anúncio' : 'Editar anúncio'}
        </Text>
        {reviewing ? (
          <Text style={styles.reviewHint} accessibilityLiveRegion="polite">
            Corrija os campos destacados para salvar.
          </Text>
        ) : null}

        {/* A trava é um aviso, não um campo desabilitado em silêncio: quem chegou
            aqui pelo card precisa entender por que não consegue mexer. */}
        {vm.locked ? <FormMessage tone="error" message={vm.lockedReason} /> : null}

        <BookFields
          draft={vm.draft}
          errors={bookErrors}
          onText={(field, value) => vm.setText(field, value)}
          onCategory={vm.setCategory}
          onCondition={vm.setCondition}
          disabled={vm.locked || vm.saving}
        />

        <ModalityFields
          modality={vm.draft.modality}
          priceInput={vm.priceInput}
          tradeTerms={vm.draft.tradeTerms}
          errors={modalityErrors}
          onModality={vm.setModality}
          onPrice={vm.setPriceInput}
          onTerms={(value) => vm.setText('tradeTerms', value)}
          disabled={vm.locked || vm.saving}
        />

        <MeetingPointField
          value={vm.draft.meetingPoint}
          onChange={vm.setMeetingPoint}
          disabled={vm.locked || vm.saving}
          publicListing
        />
        <View style={styles.cover}>
          <Text style={styles.sectionTitle}>Foto do exemplar</Text>
          <CoverPicker
            picked={vm.cover}
            currentUrl={vm.coverCleared ? null : vm.listing?.coverUrl}
            onPick={vm.pickCover}
            onClear={vm.clearCover}
            disabled={vm.locked || vm.saving}
          />
        </View>

        <FormMessage tone="error" message={vm.error} />
        <FormMessage tone="success" message={vm.saved ? 'Alterações salvas.' : null} />

        <View style={styles.actions}>
          <Button
            label="Salvar alterações"
            onPress={vm.save}
            loading={vm.saving}
            disabled={vm.locked}
          />
          <Button
            label="Voltar"
            variant="text"
            disabled={vm.saving}
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  title: { ...typography.titleLarge, color: colors.text },
  reviewHint: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginTop: -spacing.sm },
  sectionTitle: { ...typography.labelMedium, color: colors.secondaryText },
  cover: { gap: spacing.xs },
  actions: { gap: spacing.xs },
});
