import { forwardRef, useId, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

type Props = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  error?: string;
  hint?: string;
  /** Campo de senha com botão Mostrar/Ocultar. */
  password?: boolean;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, password = false, onFocus, onBlur, ...input },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const id = useId();
  const describedBy = error ? `${id}-erro` : hint ? `${id}-dica` : undefined;
  return (
    <View style={styles.container}>
      <Text nativeID={`${id}-rotulo`} style={styles.label}>
        {label}
      </Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          Boolean(error) && styles.fieldError,
          input.editable === false && styles.fieldDisabled,
        ]}
      >
        <TextInput
          ref={ref}
          {...input}
          accessibilityLabel={label}
          accessibilityLabelledBy={`${id}-rotulo`}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          secureTextEntry={password && !visible}
          placeholderTextColor={colors.secondaryText}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={styles.input}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`
            }
            onPress={() => setVisible((value) => !value)}
            style={styles.toggle}
            hitSlop={spacing.xxs}
          >
            <Text style={styles.toggleText}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        )}
      </View>
      {error ? (
        <Text nativeID={`${id}-erro`} style={styles.error} accessibilityLiveRegion="polite">
          {/* O prefixo textual evita depender só da cor para indicar erro. */}
          Erro: {error}
        </Text>
      ) : hint ? (
        <Text nativeID={`${id}-dica`} style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.action, color: colors.text },
  field: {
    borderRadius: metrics.fieldRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Borda de 2 px com margem de -1 px: destaca foco e erro sem deslocar o layout.
  fieldFocused: { borderColor: colors.focus, borderWidth: 2, margin: -1 },
  fieldError: { borderColor: colors.error, borderWidth: 2, margin: -1 },
  fieldDisabled: { backgroundColor: colors.disabledBackground },
  input: {
    ...typography.body,
    flex: 1,
    alignSelf: 'stretch',
    minHeight: Math.max(metrics.controlHeight, metrics.touchTarget),
    color: colors.text,
    paddingHorizontal: spacing.md,
    // Na Web o foco aparece na borda do campo (fieldFocused), não no contorno padrão do input.
    // `outlineStyle: 'none'` existe no react-native-web, mas não nos tipos do React Native.
    ...Platform.select({ web: { outlineStyle: 'none' } as unknown as TextStyle, default: {} }),
  },
  toggle: {
    minWidth: metrics.touchTarget,
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { ...typography.action, color: colors.actionDeep },
  error: { ...typography.caption, color: colors.error },
  hint: { ...typography.caption, color: colors.secondaryText },
});
