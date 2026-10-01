import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, metrics, spacing, typography } from '../theme/nativeTheme';
import { AppIcon, type AppIconName } from './AppIcon';

/** Ícone de cada aba; as outras features acrescentam as suas aqui. */
const tabIcons: Record<string, AppIconName> = { inicio: 'home', explorar: 'search' };

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
  return (
    <View
      style={[styles.bar, { paddingBottom: spacing.xs + insets.bottom }]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;
        const selected = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={onPress}
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
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background,
    borderTopWidth: metrics.borderThin,
    borderTopColor: colors.border,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: { backgroundColor: colors.soft },
  indicatorPressed: { backgroundColor: colors.pressed },
  label: { ...typography.labelMedium, color: colors.text },
  labelSelected: { color: colors.actionDeep },
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
