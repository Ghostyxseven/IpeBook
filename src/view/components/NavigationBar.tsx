import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, metrics, radius, spacing, typography } from '../theme/nativeTheme';
import { AppIcon, type AppIconName } from './AppIcon';
import { GlassSurface } from './ui/GlassSurface';

/** Ícone de cada aba; as outras features acrescentam as suas aqui. */
const tabIcons: Record<string, AppIconName> = {
  inicio: 'home',
  explorar: 'search',
  estante: 'bookmark',
  conversas: 'chat',
  perfil: 'person',
};

/**
 * Barra de navegação do Material 3 (Figma, "Navegação principal"):
 * indicador em pílula atrás do ícone da aba ativa e rótulo sempre visível.
 */
/** A barra some com o teclado aberto para não cobrir o campo de busca. */
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

export function NavigationBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const keyboardOpen = useKeyboardOpen();
  if (keyboardOpen && Platform.OS === 'android') return null;
  // No iPhone a barra flutua em Liquid Glass (referência `ios.md`); no Android e na Web
  // continua sólida, com a borda de cima do Material 3.
  const Surface = Platform.OS === 'ios' ? GlassSurface : View;

  const goTo = (route: (typeof state.routes)[number], index: number) => {
    const selected = state.index === index;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params);
  };

  // No iPhone, "Explorar" não fica na fileira: vira a aba de busca, num círculo à parte
  // (referência `ios.md`: "Explorar é a aba de busca (Tab(role: .search)), no círculo à
  // direita"). No Android e na Web as cinco abas continuam juntas, como o Material 3 pede.
  const routes = state.routes.map((route, index) => ({ route, index }));
  const searchEntry =
    Platform.OS === 'ios' ? routes.find((r) => r.route.name === 'explorar') : null;
  const mainEntries = searchEntry ? routes.filter((r) => r.route.name !== 'explorar') : routes;

  return (
    <Surface
      style={[styles.bar, { paddingBottom: spacing.xs + insets.bottom }]}
      accessibilityRole="tablist"
    >
      {mainEntries.map(({ route, index }) => {
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;
        const selected = state.index === index;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => goTo(route, index)}
            style={({ focused }: { pressed: boolean; focused?: boolean }) => [
              styles.item,
              focused && styles.focused,
            ]}
          >
            {({ pressed }) => (
              <>
                <View
                  style={[
                    styles.indicator,
                    selected && styles.indicatorSelected,
                    pressed && !selected && styles.indicatorPressed,
                  ]}
                >
                  <AppIcon name={tabIcons[route.name] ?? 'home'} color={colors.actionDeep} />
                </View>
                <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
              </>
            )}
          </Pressable>
        );
      })}
      {searchEntry && (
        <Pressable
          key={searchEntry.route.key}
          accessibilityRole="tab"
          accessibilityLabel={
            typeof descriptors[searchEntry.route.key].options.title === 'string'
              ? (descriptors[searchEntry.route.key].options.title as string)
              : 'Explorar'
          }
          accessibilityState={{ selected: state.index === searchEntry.index }}
          onPress={() => goTo(searchEntry.route, searchEntry.index)}
          style={({ focused }: { pressed: boolean; focused?: boolean }) => [
            styles.searchItem,
            focused && styles.focused,
          ]}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.searchCircle,
                state.index === searchEntry.index && styles.searchCircleSelected,
                pressed && state.index !== searchEntry.index && styles.indicatorPressed,
              ]}
            >
              <AppIcon
                name="search"
                color={
                  state.index === searchEntry.index ? colors.containerLowest : colors.actionDeep
                }
              />
            </View>
          )}
        </Pressable>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  bar: Platform.select({
    ios: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    default: {
      flexDirection: 'row',
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.xs,
      backgroundColor: colors.background,
      borderTopWidth: metrics.borderThin,
      borderTopColor: colors.border,
    },
  }),
  item: {
    flex: 1,
    minHeight: spacing.xxl + spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  indicator: {
    width: spacing.xxl + spacing.md,
    height: spacing.xl,
    // Pílula: metade da altura (o raio 9999 não é aplicado pelo Android nesta vista).
    borderRadius: spacing.xl / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: { backgroundColor: colors.soft },
  indicatorPressed: { backgroundColor: colors.pressed },
  label: { ...typography.labelMedium, color: colors.text },
  labelSelected: { color: colors.actionDeep },
  // A aba de busca do iPhone: círculo à parte da fileira, sem rótulo (referência `ios.md`).
  searchItem: {
    minWidth: metrics.touchTarget,
    minHeight: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.soft,
  },
  searchCircleSelected: { backgroundColor: colors.actionDeep },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
});
