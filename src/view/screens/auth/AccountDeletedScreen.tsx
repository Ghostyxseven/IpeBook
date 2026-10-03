import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { afterSignOut } from '../../../viewmodel/afterSignOut';
import { AuthSuccessScreen } from './AuthSuccessScreen';

/** Conta excluída (Figma 07.17): a sessão já acabou e os dados foram apagados. */
export function AccountDeletedScreen() {
  const router = useRouter();
  useEffect(() => afterSignOut.clear(), []);
  const goToStart = () => router.replace('/');
  return (
    <AuthSuccessScreen
      barTitle="Conta excluída"
      title="Sua conta foi excluída."
      description="Seu perfil e seus anúncios ficaram indisponíveis."
      primary={{ label: 'Voltar ao início', onPress: goToStart }}
      onBack={goToStart}
    />
  );
}
