import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

export const SEARCH_PLACEHOLDER = 'Buscar título, autor ou categoria';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/** Barra de busca do Material 3 que só abre o Explorar (Início, Figma 02). */
export function SearchBarButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="search"
      accessibilityLabel={SEARCH_PLACEHOLDER}
      accessibilityHint="Abre o Explorar"
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.bar,
        pressed && styles.pressed,
        focused && focusRing,
      ]}
    >
      <View style={styles.leading}>
        <AppIcon name="search" />
      </View>
      <Text style={styles.placeholder} numberOfLines={1}>
        {SEARCH_PLACEHOLDER}
      </Text>
    </Pressable>
  );
}

/** Barra de busca do Material 3 com campo de texto (Explorar, Figma 03). */
export const SearchBarInput = forwardRef<
  TextInput,
  { value: string; onChangeText: (text: string) => void }
>(function SearchBarInput({ value, onChangeText }, ref) {
  return (
    <View style={styles.bar}>
      <View style={styles.leading}>
        <AppIcon name="search" />
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={SEARCH_PLACEHOLDER}
        placeholderTextColor={colors.secondaryText}
        accessibilityLabel={SEARCH_PLACEHOLDER}
        accessibilityHint="Digite pelo menos 2 letras"
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          onPress={() => onChangeText('')}
          style={({ focused }: { pressed: boolean; focused?: boolean }) => [
            styles.trailing,
            focused && focusRing,
          ]}
        >
          <AppIcon name="close" color={colors.secondaryText} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    minHeight: metrics.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  pressed: { backgroundColor: colors.pressed },
  leading: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailing: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { ...typography.bodyLarge, color: colors.secondaryText, flex: 1 },
  input: {
    ...typography.bodyLarge,
    color: colors.text,
    flex: 1,
    minHeight: metrics.touchTarget,
    paddingVertical: 0,
  },
});
