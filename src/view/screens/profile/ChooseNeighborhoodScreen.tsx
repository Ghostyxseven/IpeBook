import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useNeighborhood } from '../../../factories/profile';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { NeighborhoodLayout, neighborhoodStyles as s } from './NeighborhoodLayout';

/** Escolher bairro (Figma 11.01): cidade fixa e bairro digitado, a partir das Configurações. */
export function ChooseNeighborhoodScreen() {
  const router = useRouter();
  const { bairro } = useLocalSearchParams<{ bairro?: string }>();
  const vm = useNeighborhood({
    onSaved: () => router.back(),
    prefill: typeof bairro === 'string' ? bairro : undefined,
  });
  return (
    <NeighborhoodLayout
      title="Onde você quer encontrar livros?"
      description="O IpêBook atende Piripiri. Escolha seu bairro para ver anúncios próximos."
      status={vm.status}
      loadError={vm.loadError}
      onRetry={vm.retry}
    >
      <View style={s.actions}>
        <TextField label="Cidade" value={vm.city} editable={false} />
        <TextField
          label="Bairro"
          value={vm.value}
          onChangeText={vm.setText}
          error={vm.error}
          autoCapitalize="words"
          returnKeyType="go"
          onSubmitEditing={vm.save}
        />
      </View>
      <View style={s.actions}>
        <Button label="Salvar localização" onPress={vm.save} loading={vm.saving} />
        <Button
          label="Usar localização"
          variant="text"
          // Troca de tela (sem empilhar): o voltar de 11.01 e de 11.02 leva às Configurações.
          onPress={() => router.replace('/permitir-localizacao')}
        />
      </View>
    </NeighborhoodLayout>
  );
}
