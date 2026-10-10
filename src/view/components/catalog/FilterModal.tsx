import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Modality } from '../../../model/entities/Listing';
import { conditionLabels, modalityLabels } from '../../../model/services/catalogFormat';
import {
  CONDITION_ORDER,
  toggleCondition,
  toggleModality,
} from '../../../model/services/catalogFilters';
import { categories } from '../../../model/services/categories';
import type { FilterDraft } from '../../../viewmodel/useCatalogSearchViewModel';
import { colors, metrics, spacing, typography, webLayout } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { ModalityChip } from './ModalityChip';
import { PriceSlider } from './PriceSlider';

type Draft = FilterDraft;

const modalities: Modality[] = ['sale', 'trade', 'donation'];

/** Espera entre a última mudança do rascunho e a contagem de "Mostrar N livros". */
const COUNT_DEBOUNCE_MS = 300;

const emptyDraft: Draft = {
  modalities: [],
  category: null,
  conditions: [],
  maxPriceCents: null,
};

/**
 * Filtrar livros (Figma 02.03, Android e iPhone). Edita uma cópia dos filtros e só aplica em
 * "Mostrar livros"; a cidade é fixa porque o app atende só Piripiri (ADR 0020).
 *
 * As seções seguem o quadro do iPhone, que é o mais completo: modalidade, conservação,
 * categoria e preço máximo. "Distância" fica de fora porque o app não conhece a localização
 * de quem usa nem guarda coordenadas do anúncio (ADR 0020).
 */
export function FilterModal({
  visible,
  initial,
  countFor,
  onApply,
  onClose,
  embedded = false,
}: {
  visible: boolean;
  initial: Draft;
  countFor: (draft: Draft) => Promise<number | null>;
  onApply: (draft: Draft) => void;
  onClose: () => void;
  embedded?: boolean;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [count, setCount] = useState<number | null>(null);

  // Cada abertura começa dos filtros em uso.
  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible]);

  // Espera a mão parar antes de contar: arrastar o preço mudaria o rascunho a cada quadro,
  // e cada mudança é uma consulta ao servidor.
  useEffect(() => {
    if (!visible) return;
    let active = true;
    setCount(null);
    const timer = setTimeout(() => {
      countFor(draft).then(
        (total) => active && setCount(total),
        () => active && setCount(null),
      );
    }, COUNT_DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [visible, draft]);

  const show =
    count === null
      ? 'Mostrar livros'
      : count === 0
        ? 'Nenhum livro com esses filtros'
        : `Mostrar ${count} ${count === 1 ? 'livro' : 'livros'}`;

  const panel = (
    <SafeAreaView
      style={[styles.screen, embedded && styles.embeddedScreen]}
      edges={['top', 'bottom']}
    >
      {!embedded && (
        <View style={styles.appBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onClose}
            style={styles.iconButton}
          >
            <AppIcon name="back" color={colors.onSurface} />
          </Pressable>
          <Text style={styles.appBarTitle} accessibilityRole="header">
            Filtrar livros
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {!embedded && (
          <View style={styles.intro}>
            <Text style={styles.headline}>Uma leitura do seu jeito.</Text>
            <Text style={styles.introText}>Escolha o que procura aqui perto.</Text>
          </View>
        )}
        <TextField label="Cidade" value="Piripiri, PI" editable={false} />

        <Text style={styles.section}>Modalidade</Text>
        <View style={styles.chips}>
          {modalities.map((modality) => (
            <ModalityChip
              key={modality}
              modality={modality}
              label={modalityLabels[modality]}
              selected={draft.modalities.includes(modality)}
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  modalities: toggleModality(current.modalities, modality),
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Conservação</Text>
        <View style={styles.chips}>
          {CONDITION_ORDER.map((condition) => (
            <ModalityChip
              key={condition}
              modality="all"
              label={conditionLabels[condition]}
              selected={draft.conditions.includes(condition)}
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  conditions: toggleCondition(current.conditions, condition),
                }))
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Categoria</Text>
        <View style={styles.chips}>
          <ModalityChip
            modality="all"
            label="Todas"
            selected={draft.category === null}
            onPress={() => setDraft((current) => ({ ...current, category: null }))}
          />
          {categories.map((category) => (
            <ModalityChip
              key={category}
              modality="all"
              label={category}
              selected={draft.category === category}
              onPress={() => setDraft((current) => ({ ...current, category }))}
            />
          ))}
        </View>

        <Text style={styles.section}>Preço máximo</Text>
        <PriceSlider
          value={draft.maxPriceCents}
          onChange={(maxPriceCents) => setDraft((current) => ({ ...current, maxPriceCents }))}
        />
        <Text style={styles.hint}>
          Vale para a venda. Livros de troca e doação continuam aparecendo.
        </Text>
      </ScrollView>

      <View style={styles.actions}>
        <Button label={show} disabled={count === 0} onPress={() => onApply(draft)} />
        <Button label="Limpar filtros" variant="text" onPress={() => setDraft(emptyDraft)} />
      </View>
    </SafeAreaView>
  );
  if (embedded) return panel;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {panel}
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  embeddedScreen: {
    width: webLayout.filterWidth,
    flex: 0,
    borderRightWidth: metrics.borderThin,
    borderRightColor: colors.border,
  },
  appBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxs,
  },
  iconButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
  },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  intro: { gap: spacing.xs, paddingTop: spacing.md },
  headline: { ...typography.brandHeadline, color: colors.onSurface },
  introText: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  section: { ...typography.titleMedium, color: colors.onSurface, marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  hint: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  actions: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.sm,
    gap: spacing.xs,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
});
