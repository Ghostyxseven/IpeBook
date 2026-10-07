import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChoiceChips } from '../listings/ChoiceChips';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { colors, spacing, typography } from '../../theme/nativeTheme';

/** O limite que o banco aceita no comentário (`check` de 3 a 280). */
export const COMMENT_LIMIT = 280;

const scores = ['1', '2', '3', '4', '5'] as const;

/**
 * Formulário de avaliação de uma negociação concluída (ADR 0027).
 *
 * Mora aqui, e não dentro de uma tela, porque a avaliação aparece em dois lugares:
 * no Histórico (spec 031) e no fim da negociação (spec 028), e as regras do banco
 * — nota de 1 a 5, comentário vazio ou de 3 a 280 letras — têm de valer nos dois.
 */
export function RatingForm({
  submitting,
  onSubmit,
  onCancel,
  cancelLabel = 'Agora não',
}: {
  submitting: boolean;
  onSubmit: (score: number, comment: string | null) => void;
  onCancel: () => void;
  cancelLabel?: string;
}) {
  const [score, setScore] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  // O banco recusa comentário com 1 ou 2 caracteres; a tela não oferece o envio.
  const commentIsShort = comment.trim().length > 0 && comment.trim().length < 3;

  return (
    <View style={styles.form}>
      <ChoiceChips
        label="Que nota você dá para este encontro?"
        options={scores.map((value) => ({ value, label: `${value}` }))}
        value={score}
        onChange={setScore}
      />
      <View>
        <TextField
          label="Comentário (opcional)"
          value={comment}
          onChangeText={setComment}
          editable={!submitting}
          multiline
          numberOfLines={3}
          maxLength={COMMENT_LIMIT}
          error={commentIsShort ? 'Escreva pelo menos três letras, ou deixe em branco.' : undefined}
          placeholder="Pontual e cuidadoso com os livros."
        />
        <Text style={styles.counter}>{`${comment.length}/${COMMENT_LIMIT}`}</Text>
      </View>
      <Text style={styles.body}>A avaliação é pública e não dá para editar depois.</Text>
      <Button
        label="Enviar avaliação"
        loading={submitting}
        disabled={!score || commentIsShort}
        onPress={() => {
          if (!score) return;
          onSubmit(Number(score), comment.trim() || null);
        }}
      />
      <Button label={cancelLabel} variant="text" onPress={onCancel} disabled={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm, marginTop: spacing.xs },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  counter: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
    marginTop: spacing.xxs,
  },
});
