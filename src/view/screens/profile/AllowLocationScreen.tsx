import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useLocateNeighborhood } from '../../../factories/profile';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { NeighborhoodLayout, neighborhoodStyles as s } from './NeighborhoodLayout';

/** Permitir localização (Figma 11.02): preenche o bairro em Escolher bairro. */
export function AllowLocationScreen() {
  const router = useRouter();
  const vm = useLocateNeighborhood({
    onFound: (bairro) => router.replace({ pathname: '/escolher-bairro', params: { bairro } }),
  });
  return (
    <NeighborhoodLayout
      title="Encontre livros perto de você."
      description="Use sua localização aproximada ou escolha seu bairro manualmente."
    >
      <FormMessage tone="error" message={vm.error} />
      <View style={s.actions}>
        <Button
          label="Usar minha localização"
          onPress={vm.locate}
          loading={vm.locating}
          accessibilityHint="Pede permissão para usar a localização aproximada"
        />
        <Button
          label="Escolher bairro"
          variant="text"
          onPress={() => router.replace('/escolher-bairro')}
        />
      </View>
    </NeighborhoodLayout>
  );
}
