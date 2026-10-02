import { StyleSheet, View } from 'react-native';
import { categories } from '../../../model/services/categories';
import { conditions, modalities } from '../../../model/services/listingValidation';
import { colors, spacing, typography } from '../../theme/nativeTheme';
import { TextField } from '../ui/TextField';
import { ChoiceChips, type Choice } from './ChoiceChips';
import { Text } from 'react-native';

type Errors = Partial<Record<string, string>>;

const categoryOptions: readonly Choice<string>[] = categories.map((name) => ({
  value: name,
  label: name,
}));

const conditionLabels: Record<(typeof conditions)[number], string> = {
  novo: 'Novo',
  como_novo: 'Como novo',
  bom: 'Bom estado',
  marcas_de_uso: 'Com marcas de uso',
};

const modalityLabels: Record<(typeof modalities)[number], string> = {
  sale: 'Venda',
  trade: 'Troca',
  donation: 'Doação',
};

/** Passo 1: o que é o livro. */
export function BookFields({
  draft,
  errors,
  onText,
  onCategory,
  onCondition,
  disabled = false,
}: {
  draft: {
    title: string;
    author: string;
    category: string;
    condition: string;
    description: string | null;
  };
  errors: Errors;
  onText: (field: 'title' | 'author' | 'description', value: string) => void;
  onCategory: (value: string) => void;
  onCondition: (value: (typeof conditions)[number]) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.fields}>
      <TextField
        label="Título do livro"
        value={draft.title}
        onChangeText={(value) => onText('title', value)}
        error={errors.title}
        editable={!disabled}
        autoCapitalize="sentences"
        returnKeyType="next"
      />
      <TextField
        label="Quem escreveu"
        value={draft.author}
        onChangeText={(value) => onText('author', value)}
        error={errors.author}
        editable={!disabled}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <ChoiceChips
        label="Categoria"
        options={categoryOptions}
        value={draft.category || null}
        onChange={onCategory}
        error={errors.category}
      />
      <ChoiceChips
        label="Estado do exemplar"
        options={conditions.map((value) => ({ value, label: conditionLabels[value] }))}
        value={draft.condition as (typeof conditions)[number]}
        onChange={onCondition}
        error={errors.condition}
      />
      <TextField
        label="Descrição (opcional)"
        value={draft.description ?? ''}
        onChangeText={(value) => onText('description', value)}
        editable={!disabled}
        multiline
        numberOfLines={4}
        hint="Conte o que mais ajuda quem vai levar: edição, marcações, se acompanha algo."
      />
    </View>
  );
}

/** Passo 2: como o livro sai — e o campo que vem com a escolha. */
export function ModalityFields({
  modality,
  priceInput,
  tradeTerms,
  errors,
  onModality,
  onPrice,
  onTerms,
  disabled = false,
}: {
  modality: (typeof modalities)[number];
  priceInput: string;
  tradeTerms: string | null;
  errors: Errors;
  onModality: (value: (typeof modalities)[number]) => void;
  onPrice: (value: string) => void;
  onTerms: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.fields}>
      <ChoiceChips
        label="Como você quer anunciar"
        options={modalities.map((value) => ({ value, label: modalityLabels[value] }))}
        value={modality}
        onChange={onModality}
        error={errors.modality}
      />

      {/* Só o campo da modalidade escolhida aparece: um preço esquecido embaixo
          de "Doação" seria recusado pelo banco e confundiria quem preenche. */}
      {modality === 'sale' ? (
        <TextField
          label="Preço"
          value={priceInput}
          onChangeText={onPrice}
          error={errors.priceCents}
          editable={!disabled}
          keyboardType="decimal-pad"
          placeholder="25,00"
          hint="Em reais. Use vírgula para os centavos."
        />
      ) : null}

      {modality === 'trade' ? (
        <TextField
          label="O que você aceita em troca"
          value={tradeTerms ?? ''}
          onChangeText={onTerms}
          error={errors.tradeTerms}
          editable={!disabled}
          multiline
          numberOfLines={3}
          placeholder="Qualquer livro de ficção científica"
        />
      ) : null}

      {modality === 'donation' ? (
        <Text style={styles.note}>Este livro será doado. Ninguém paga nada.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
  note: { ...typography.bodyMedium, color: colors.secondaryText },
});
