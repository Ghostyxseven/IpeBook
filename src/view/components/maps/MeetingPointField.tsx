import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MeetingPoint } from '../../../model/entities/MeetingPoint';
import { useMeetingPointPicker } from '../../../viewmodel/useMeetingPointPicker';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { TextField } from '../ui/TextField';
import { PublicMap } from './PublicMap';

export function MeetingPointField({
  value = null,
  onChange,
  disabled = false,
  publicListing = false,
}: {
  value?: MeetingPoint | null;
  onChange: (value: MeetingPoint | null) => void;
  disabled?: boolean;
  publicListing?: boolean;
}) {
  const vm = useMeetingPointPicker(value, onChange);
  return (
    <View style={styles.field}>
      <Text style={styles.title}>Ponto público no mapa (opcional)</Text>
      <Text style={styles.body}>
        {publicListing
          ? 'A capa do livro aparecerá neste ponto para quem explorar o mapa. Escolha um local público, nunca sua casa.'
          : 'Marque um lugar público para o encontro. Este ponto fica na negociação e não muda o anúncio.'}
      </Text>
      {value ? <Text style={styles.body}>{value.name}</Text> : null}
      <Button
        label={value ? 'Ver ou alterar ponto no mapa' : 'Escolher ponto no mapa'}
        variant="secondary"
        disabled={disabled}
        onPress={vm.open}
      />
      {value ? (
        <Button
          label="Remover ponto do mapa"
          variant="text"
          disabled={disabled}
          onPress={() => onChange(null)}
        />
      ) : null}
      <Modal
        visible={vm.opened}
        animationType="none"
        onRequestClose={vm.close}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" style={styles.heading}>
              Onde vocês podem se encontrar?
            </Text>
            <Text style={styles.body}>
              Dê um nome ao local e toque no mapa para marcar o ponto. O mapa começa em Piripiri e
              não usa sua localização.
            </Text>
            <TextField
              label="Nome do local público"
              value={vm.name}
              onChangeText={vm.setName}
              maxLength={160}
              placeholder="Ex.: entrada da biblioteca"
            />
            <PublicMap point={vm.coordinates} onPoint={vm.select} />
            <Text style={styles.body}>
              Você também pode informar as coordenadas do local público.
            </Text>
            <TextField
              label="Latitude do ponto"
              value={vm.latitude}
              onChangeText={vm.setLatitude}
              placeholder="Ex.: -4,273"
              keyboardType="numbers-and-punctuation"
            />
            <TextField
              label="Longitude do ponto"
              value={vm.longitude}
              onChangeText={vm.setLongitude}
              placeholder="Ex.: -41,776"
              keyboardType="numbers-and-punctuation"
            />
            <Checkbox
              checked={vm.confirmed}
              onToggle={vm.toggleConfirmed}
              label="Escolhi um local público, não um endereço particular."
            />
            <Button
              label="Usar este ponto público"
              onPress={vm.confirm}
              disabled={!vm.canConfirm || disabled}
            />
            <Button label="Cancelar" variant="text" onPress={vm.close} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  title: { ...typography.titleMedium, color: colors.text },
  heading: { ...typography.brandTitle, color: colors.text },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth * 2,
    alignSelf: 'center',
  },
});
