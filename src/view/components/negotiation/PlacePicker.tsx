import { StyleSheet, Text, View } from 'react-native';
import {
  isSuggestedPlace,
  meetingPlaceSuggestions,
} from '../../../model/services/bookRequestFormat';
import { ModalityChip } from '../catalog/ModalityChip';
import { TextField } from '../ui/TextField';
import { colors, spacing, typography } from '../../theme/nativeTheme';

/**
 * "Onde" do Combinar encontro (Figma 06.04): atalhos para lugares públicos e movimentados,
 * mais "Outro local" para escrever. O campo continua sendo a fonte do valor — os chips só
 * preenchem —, então quem usa teclado ou leitor de tela nunca fica sem saída.
 */
export function PlacePicker({
  label = 'Local público',
  value,
  onChange,
  hint = 'Prefira lugares movimentados, como praças e bibliotecas. Combinem o ponto exato na conversa.',
}: {
  label?: string;
  value: string;
  onChange: (place: string) => void;
  hint?: string;
}) {
  const custom = value.trim() !== '' && !isSuggestedPlace(value);
  return (
    <View style={styles.wrapper}>
      <View style={styles.chips} accessibilityLabel="Sugestões de local">
        {meetingPlaceSuggestions.map((place) => (
          <ModalityChip
            key={place}
            modality="all"
            label={place}
            selected={value.trim() === place}
            onPress={() => onChange(place)}
          />
        ))}
        <ModalityChip
          modality="all"
          label="Outro local"
          selected={custom}
          // Só limpa quando sai de uma sugestão: o que a pessoa escreveu não se perde.
          onPress={() => onChange(custom ? value : '')}
        />
      </View>
      <TextField
        label={label}
        placeholder="Ex.: Praça da Matriz, Biblioteca Municipal"
        autoCorrect={false}
        value={value}
        onChangeText={onChange}
        hint={hint}
      />
      {custom ? <Text style={styles.note}>Combine um lugar público e movimentado.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  note: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});
