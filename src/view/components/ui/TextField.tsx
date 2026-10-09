import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
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
import { AppIcon } from '../AppIcon';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

type Props = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  error?: string;
  hint?: string;
  /** Campo de senha com botão Mostrar/Ocultar. */
  password?: boolean;
};

/**
 * Android e Web seguem o componente "Campo" do Figma (Material 3, ADR 0013): contornado,
 * rótulo dentro da caixa e erro com ícone e mensagem que diz como corrigir.
 * No iOS segue o "Text Field" do Figma (issue #10): rótulo `ios-footnote` acima, célula
 * preenchida `ios.cell` com raio 12 e sem borda; a borda só aparece no foco e no erro.
 */
const material = Platform.OS !== 'ios';

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, password = false, onFocus, onBlur, ...input },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => inputRef.current as TextInput);
  const id = useId();
  const describedBy = error ? `${id}-erro` : hint ? `${id}-dica` : undefined;

  const field = (
    <TextInput
      ref={inputRef}
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
      style={material ? styles.materialInput : styles.input}
    />
  );

  const toggle = password && (
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
  );

  const boxState = [
    focused && styles.fieldFocused,
    Boolean(error) && styles.fieldError,
    input.editable === false && styles.fieldDisabled,
  ];

  const support = error ? (
    <View
      nativeID={`${id}-erro`}
      style={material ? styles.materialError : undefined}
      accessible
      // O ícone e a borda indicam o erro visualmente; o leitor de tela ouve "Erro:".
      accessibilityLabel={`Erro: ${error}`}
      accessibilityLiveRegion="polite"
    >
      {material && <AppIcon name="error" size={spacing.md} color={colors.error} />}
      <Text style={[styles.error, material && styles.materialErrorText]}>
        {material ? error : `Erro: ${error}`}
      </Text>
    </View>
  ) : hint ? (
    <Text nativeID={`${id}-dica`} style={[styles.hint, material && styles.materialSupport]}>
      {hint}
    </Text>
  ) : null;

  if (material) {
    return (
      <View style={styles.materialContainer}>
        {/* Tocar em qualquer parte da caixa, inclusive no rótulo, foca o campo. */}
        <Pressable
          accessible={false}
          onPress={() => inputRef.current?.focus()}
          style={[styles.materialBox, ...boxState]}
        >
          <View style={styles.materialContent}>
            <Text
              nativeID={`${id}-rotulo`}
              style={[
                styles.materialLabel,
                focused && styles.materialLabelFocused,
                Boolean(error) && styles.materialLabelError,
              ]}
            >
              {label}
            </Text>
            {field}
          </View>
          {toggle}
        </Pressable>
        {support}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text nativeID={`${id}-rotulo`} style={styles.label}>
        {label}
      </Text>
      <View style={[styles.field, ...boxState]}>
        {field}
        {toggle}
      </View>
      {support}
    </View>
  );
});

const strongOffset = metrics.borderStrong - metrics.borderThin;
const noWebOutline = Platform.select({
  // Na Web o foco aparece na borda do campo, não no contorno padrão do input.
  // `outlineStyle: 'none'` existe no react-native-web, mas não nos tipos do React Native.
  web: { outlineStyle: 'none' } as unknown as TextStyle,
  default: {},
});

const styles = StyleSheet.create({
  // iOS (Figma 01.10, iPhone).
  container: { gap: spacing.xs },
  label: { ...typography.iosFootnote, color: colors.onSurfaceVariant },
  field: {
    borderRadius: metrics.fieldRadius,
    borderWidth: metrics.borderThin,
    borderColor: 'transparent',
    backgroundColor: colors.iosCell,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...typography.iosBody,
    flex: 1,
    alignSelf: 'stretch',
    minHeight: Math.max(metrics.controlHeight, metrics.touchTarget),
    color: colors.text,
    paddingHorizontal: spacing.md,
    ...noWebOutline,
  },
  // Borda forte com margem negativa equivalente: destaca foco e erro sem deslocar o layout.
  fieldFocused: {
    borderColor: colors.focus,
    borderWidth: metrics.borderStrong,
    margin: -strongOffset,
  },
  fieldError: {
    borderColor: colors.error,
    borderWidth: metrics.borderStrong,
    margin: -strongOffset,
  },
  fieldDisabled: { backgroundColor: colors.disabledBackground },
  error: { ...typography.caption, color: colors.error },
  hint: {
    ...(material ? typography.caption : typography.iosFootnote),
    color: material ? colors.secondaryText : colors.iosSecondaryLabel,
  },

  // Android e Web (Figma "Campo"): caixa com rótulo dentro, espaçamento 16/12 e raio médio.
  materialContainer: { gap: spacing.xxs },
  materialBox: {
    minHeight: metrics.touchTarget,
    borderRadius: radius.medium,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialContent: { flex: 1, gap: spacing.xxs, paddingRight: spacing.md },
  materialLabel: { ...typography.labelMedium, color: colors.secondaryText },
  materialLabelFocused: { color: colors.focus },
  materialLabelError: { color: colors.error },
  materialInput: {
    ...typography.bodyLarge,
    color: colors.text,
    padding: 0,
    margin: 0,
    ...noWebOutline,
  },
  materialError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingLeft: spacing.md,
  },
  materialErrorText: { flex: 1 },
  materialSupport: { paddingLeft: spacing.md },
  toggle: {
    minWidth: metrics.touchTarget,
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    ...(material ? typography.labelLarge : typography.action),
    color: colors.actionDeep,
  },
});
