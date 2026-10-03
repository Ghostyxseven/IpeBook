import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { Wordmark } from './Wordmark';

/**
 * Estrutura comum das telas de acesso, conforme o Figma IpêBook (seção "01 · Acesso"):
 * logotipo opcional, título de marca em Source Serif com trecho destacado, explicação,
 * formulário e ações. Também cuida de rolagem, teclado, área segura e largura de leitura.
 */
export function AuthLayout({
  title,
  highlight,
  description,
  brand = false,
  children,
  footer,
}: {
  title: string;
  /** Trecho final do título com o marca-texto amarelo (ex.: "acesso."). */
  highlight?: string;
  description?: string;
  /** Mostra o logotipo acima do título, como nas telas de entrada do Figma. */
  brand?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const fullTitle = highlight ? `${title} ${highlight}` : title;
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {brand && <Wordmark />}
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header" accessibilityLabel={fullTitle}>
                {title}
                {highlight ? (
                  <>
                    {' '}
                    <Text style={styles.highlight}>{highlight}</Text>
                  </>
                ) : null}
              </Text>
              {description && <Text style={styles.description}>{description}</Text>}
            </View>
            <View style={styles.form}>{children}</View>
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  // O Figma alinha o conteúdo ao topo, logo abaixo da barra.
  scroll: { flexGrow: 1, padding: metrics.pagePadding },
  content: { width: '100%', maxWidth: metrics.formMaxWidth, alignSelf: 'center', gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { ...typography.brandDisplay, color: colors.onSurface },
  highlight: {
    backgroundColor: colors.tertiaryContainer,
    borderRadius: radius.small,
  },
  description: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  form: { gap: spacing.md },
  footer: { gap: spacing.xs, alignItems: 'stretch' },
});
