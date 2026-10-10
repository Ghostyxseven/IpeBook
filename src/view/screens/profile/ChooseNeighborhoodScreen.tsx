import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useNeighborhood } from '../../../factories/profile';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { RadioGroup, RadioListItem } from '../../components/ui/RadioListItem';
import { TextField } from '../../components/ui/TextField';
import { NeighborhoodLayout, neighborhoodStyles as s } from './NeighborhoodLayout';

/** Escolher bairro (Figma 11.01): cidade fixa e bairro escolhido numa lista, a partir das
 * Configurações. Mesma lista de bairros de Piripiri da tela Seu bairro (Figma 01.17), para
 * a pessoa não precisar digitar — "Outro bairro…" continua existindo para quem não está nela. */
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
        <RadioGroup label="Bairro" header="Bairros em Piripiri">
          {vm.suggestions.map((name) => (
            <RadioListItem
              key={name}
              label={name}
              selected={vm.choice === name}
              onPress={() => vm.choose(name)}
            />
          ))}
          <RadioListItem
            label="Outro bairro…"
            supportingText="Digite o nome do seu bairro"
            selected={vm.choice === 'other'}
            onPress={() => vm.choose('other')}
          />
        </RadioGroup>
        {vm.choice === 'other' ? (
          <TextField
            label="Nome do bairro"
            value={vm.text}
            onChangeText={vm.setText}
            error={vm.error}
            autoCapitalize="words"
            autoFocus
            returnKeyType="go"
            onSubmitEditing={vm.save}
          />
        ) : (
          <FormMessage tone="error" message={vm.error} />
        )}
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
