import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BRAND_FONT, colors } from '../view/theme/nativeTheme';

/** Layout raiz do app (Android e iOS). A sessão é criada nos grupos (auth) e (app). */
export default function RootLayout() {
  // Não segura a abertura: até a fonte carregar, o título usa a fonte do sistema.
  useFonts({ [BRAND_FONT]: require('../../assets/fonts/SourceSerif4-Bold.ttf') });
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </SafeAreaProvider>
  );
}
