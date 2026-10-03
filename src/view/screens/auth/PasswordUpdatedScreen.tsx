import { useRouter } from 'expo-router';
import { AuthSuccessScreen } from './AuthSuccessScreen';

/** Figma 01.09: a nova senha foi gravada e a sessão já começou. */
export function PasswordUpdatedScreen() {
  const router = useRouter();
  const goHome = () => router.replace('/inicio');
  return (
    <AuthSuccessScreen
      barTitle="Nova senha"
      title="Tudo certo com seu acesso."
      description="Sua nova senha foi salva e você já está na sua conta."
      card={{
        title: 'Senha atualizada',
        text: 'Agora você pode acessar sua conta com a nova senha.',
      }}
      primary={{ label: 'Entrar na minha conta', onPress: goHome }}
      onBack={goHome}
    />
  );
}
