import { Tabs } from 'expo-router/js-tabs';
import { colors, typography } from '../../../view/theme/nativeTheme';

/**
 * Abas da área autenticada. As outras features acrescentam suas abas aqui.
 * Sem ícones até existir o ADR da biblioteca de ícones por plataforma (spec 013).
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.actionDeep,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { ...typography.action },
        tabBarLabelPosition: 'beside-icon',
        tabBarIconStyle: { display: 'none' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: 'Início' }} />
      <Tabs.Screen name="buscar" options={{ title: 'Buscar' }} />
    </Tabs>
  );
}
