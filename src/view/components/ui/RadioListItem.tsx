import { Children, Fragment, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

const ios = Platform.OS === 'ios';

/**
 * Grupo de escolha única (Figma 01.17). No Android e na Web é a lista do Material 3; no iPhone
 * é a lista agrupada do iOS, com cabeçalho em maiúsculas, células `ios.cell` e separadores.
 */
export function RadioGroup({
  label,
  header,
  children,
}: {
  /** Nome do grupo para o leitor de tela. */
  label: string;
  /** Cabeçalho da lista agrupada no iPhone (ex.: "Bairros em Piripiri"). */
  header?: string;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  return (
    <View style={styles.groupWrapper}>
      {ios && header ? (
        <Text style={styles.header} accessibilityRole="header">
          {header.toUpperCase()}
        </Text>
      ) : null}
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={ios ? styles.iosGroup : styles.group}
      >
        {items.map((item, index) => (
          <Fragment key={index}>
            {ios && index > 0 ? <View style={styles.separator} /> : null}
            {item}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

/**
 * Item de escolha única. Android e Web: rádio no fim (Material 3). iPhone: marca de seleção
 * (`checkmark`) no fim, como nas listas do iOS. A linha inteira é tocável e anuncia se está marcada.
 */
export function RadioListItem({
  label,
  supportingText,
  selected,
  onPress,
}: {
  label: string;
  supportingText?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={supportingText ? `${label}. ${supportingText}` : label}
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.row,
        ios && styles.iosRow,
        pressed && styles.pressed,
        focused && styles.focused,
      ]}
    >
      <View style={styles.copy}>
        <Text style={ios ? styles.iosLabel : styles.label}>{label}</Text>
        {supportingText && (
          <Text style={ios ? styles.iosSupporting : styles.supporting}>{supportingText}</Text>
        )}
      </View>
      {ios ? (
        selected ? (
          <AppIcon name="check" size={20} color={colors.action} />
        ) : null
      ) : (
        <AppIcon
          name={selected ? 'radioOn' : 'radioOff'}
          color={selected ? colors.action : colors.onSurfaceVariant}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  groupWrapper: { gap: spacing.sm },
  group: { marginHorizontal: -spacing.md },
  header: { ...typography.iosFootnote, color: colors.iosSecondaryLabel },
  // Lista agrupada do iOS (Figma 01.17, iPhone): cantos de 12 e separador recuado.
  iosGroup: {
    borderRadius: metrics.fieldRadius,
    overflow: 'hidden',
    backgroundColor: colors.iosCell,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md,
    backgroundColor: colors.iosSeparator,
  },
  row: {
    minHeight: metrics.touchTarget + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.small,
  },
  iosRow: { borderRadius: 0, paddingVertical: spacing.sm },
  pressed: { backgroundColor: colors.pressed },
  focused: {
    outlineColor: colors.focus,
    outlineStyle: 'solid',
    outlineWidth: metrics.focusWidth,
  },
  copy: { flex: 1 },
  label: { ...typography.bodyLarge, color: colors.onSurface },
  supporting: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  iosLabel: { ...typography.iosBody, color: colors.onSurface },
  iosSupporting: { ...typography.iosFootnote, color: colors.iosSecondaryLabel },
});
