import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

export type ShelfTab = 'anuncios' | 'propostas' | 'concluidos';

/** Abas primárias do Material 3 com rótulo (Figma 05.01, "Material 3 · Tabs"). */
export function ShelfTabs({
  tabs,
  selected,
  onSelect,
}: {
  tabs: { key: ShelfTab; label: string }[];
  selected: ShelfTab;
  onSelect: (tab: ShelfTab) => void;
}) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const active = tab.key === selected;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={styles.inner}>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
              <View style={[styles.indicator, !active && styles.indicatorHidden]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderBottomWidth: metrics.borderThin,
    borderBottomColor: colors.outlineVariant,
  },
  tab: {
    flex: 1,
    minHeight: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pressed: { backgroundColor: colors.pressed },
  // O indicador tem a largura do rótulo, como no M3.
  inner: { alignItems: 'stretch', paddingTop: spacing.sm },
  label: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
  labelActive: { color: colors.action },
  indicator: {
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: colors.action,
  },
  // Reserva a altura do indicador para os rótulos ficarem na mesma linha.
  indicatorHidden: { backgroundColor: 'transparent' },
});
