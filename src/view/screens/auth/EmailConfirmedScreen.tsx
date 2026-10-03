import { useRouter } from 'expo-router';
import { AuthSuccessScreen } from './AuthSuccessScreen';

/** Figma 01.13: e-mail confirmado no cadastro, com os dois primeiros caminhos do app. */
export function EmailConfirmedScreen() {
  const router = useRouter();
  return (
    <AuthSuccessScreen
      barTitle="Confirmar e-mail"
      title="Sua história pode continuar."
      description="Seu e-mail foi confirmado. Agora você pode anunciar livros e conversar com a comunidade."
      primary={{ label: 'Explorar livros', onPress: () => router.replace('/explorar') }}
      secondary={{
        label: 'Anunciar meu primeiro livro',
        onPress: () => router.replace('/anunciar'),
      }}
      onBack={() => router.replace('/inicio')}
    />
  );
}
