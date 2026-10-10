import { Tabs } from 'expo-router/js-tabs';
import { useWebLayout } from '../../../view/hooks/useWebLayout';
import { NavigationBar } from '../../../view/components/NavigationBar';
import { colors } from '../../../view/theme/nativeTheme';

/** Abas da área autenticada com a barra de navegação do Material 3 (Figma). */
export default function TabsLayout() {
  const { medium } = useWebLayout();
  return (
    <Tabs
      tabBar={(props) => (medium ? null : <NavigationBar {...props} />)}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: 'Início' }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="estante" options={{ title: 'Estante' }} />
      <Tabs.Screen name="conversas" options={{ title: 'Conversas' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
