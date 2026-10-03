import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CatalogFilters, Modality } from '../../../model/entities/Listing';
import { modalityLabels } from '../../../model/services/catalogFormat';
import { toggleModality } from '../../../model/services/catalogFilters';
import { categories } from '../../../model/services/categories';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { ModalityChip } from './ModalityChip';

type Draft = Pick<CatalogFilters, 'modalities' | 'category' | 'goodCondition'>;

const modalities: Modality[] = ['sale', 'trade', 'donation'];

/**
 * Filtrar livros (Figma Android 02.03). Edita uma cópia dos filtros e só aplica em
 * "Mostrar livros"; a cidade é fixa porque o app atende só Piripiri (ADR 0020).
 */
export function FilterModal({
  visible,
  initial,
  countFor,
  onApply,
  onClose,
}: {
  visible: boolean;
  initial: Draft;
  countFor: (draft: Draft) => Promise<number | null>;
  onApply: (draft: Draft) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [count, setCount] = useState<number | null>(null);

  // Cada abertura começa dos filtros em uso.
  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setCount(null);
    countFor(draft).then(
      (total) => active && setCount(total),
      () => active && setCount(null),
    );
    return () => {
      active = false;
    };
  }, [visible, draft]);

  const show =
    count === null
      ? 'Mostrar livros'
      : count === 0
        ? 'Nenhum livro com esses filtros'
        : `Mostrar ${count} ${count === 1 ? 'livro' : 'livros'}`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
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

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.intro}>
            <Text style={styles.headline}>Uma leitura do seu jeito.</Text>
            <Text style={styles.introText}>Escolha o que procura aqui perto.</Text>
          </View>
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

          <Text style={styles.section}>Condição do livro</Text>
          <View accessibilityRole="radiogroup">
            <Radio
              label="Todas as condições"
              selected={!draft.goodCondition}
              onPress={() => setDraft((current) => ({ ...current, goodCondition: false }))}
            />
            <Radio
              label="Somente bom estado"
              selected={Boolean(draft.goodCondition)}
              onPress={() => setDraft((current) => ({ ...current, goodCondition: true }))}
            />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button label={show} disabled={count === 0} onPress={() => onApply(draft)} />
          <Button
            label="Limpar filtros"
            variant="text"
            onPress={() => setDraft({ modalities: [], category: null, goodCondition: false })}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Radio({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.radio, pressed && styles.pressed]}
    >
      <AppIcon
        name={selected ? 'radioOn' : 'radioOff'}
        color={selected ? colors.action : colors.onSurfaceVariant}
      />
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
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
  radio: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  pressed: { backgroundColor: colors.pressed },
  radioLabel: { ...typography.bodyLarge, color: colors.onSurface },
  actions: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.sm,
    gap: spacing.xs,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
});
