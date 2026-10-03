import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useNeighborhood } from '../../../factories/profile';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { RadioListItem } from '../../components/ui/RadioListItem';
import { TextField } from '../../components/ui/TextField';
import { NeighborhoodLayout, neighborhoodStyles as s } from './NeighborhoodLayout';

/** Seu bairro (Figma 01.17): aparece depois de confirmar o e-mail, antes de explorar. */
export function YourNeighborhoodScreen() {
  const router = useRouter();
  const vm = useNeighborhood({ onSaved: () => router.replace('/explorar') });
  return (
    <NeighborhoodLayout
      title="Qual é o seu bairro?"
      description="O IpêBook é feito para Piripiri. Escolha seu bairro para ver o que está mais perto."
      status={vm.status}
      loadError={vm.loadError}
      onRetry={vm.retry}
    >
      <View style={s.group} accessibilityRole="radiogroup" accessibilityLabel="Seu bairro">
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
      </View>
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
      <Text style={s.note}>
        Só o bairro aparece nos seus anúncios. Seu endereço nunca é mostrado.
      </Text>
      <View style={s.actions}>
        <Button label="Começar a explorar" onPress={vm.save} loading={vm.saving} />
      </View>
    </NeighborhoodLayout>
  );
}
