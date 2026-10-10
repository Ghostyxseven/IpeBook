import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useWebLayout } from '../../hooks/useWebLayout';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Estrutura comum de Seu bairro, Escolher bairro e Permitir localização (Figma 01.17 e 11). */
export function NeighborhoodLayout({
  title,
  description,
  status = 'ready',
  loadError,
  onRetry,
  children,
}: {
  title: string;
  description: string;
  status?: 'loading' | 'ready' | 'error';
  loadError?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  const { large } = useWebLayout();
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {status === 'loading' ? (
          <LoadingState message="Carregando seu bairro…" />
        ) : status === 'error' ? (
          <View style={styles.scroll}>
            <ErrorState message={loadError ?? ''} onRetry={onRetry} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={[styles.content, large && styles.desktopContent]}>
              <View style={[styles.header, large && styles.desktopHeader]}>
                <Text style={styles.title} accessibilityRole="header">
                  {title}
                </Text>
                <Text style={styles.description}>{description}</Text>
              </View>
              <View style={[styles.fields, large && styles.desktopFields]}>{children}</View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const neighborhoodStyles = StyleSheet.create({
  note: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  actions: { gap: spacing.xs },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, padding: metrics.pagePadding },
  content: { width: '100%', maxWidth: metrics.formMaxWidth, alignSelf: 'center', gap: spacing.lg },
  desktopContent: {
    maxWidth: metrics.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: { gap: spacing.xs },
  desktopHeader: {
    flex: 1,
    minWidth: 0,
    padding: spacing.xl,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.containerLow,
  },
  fields: { gap: spacing.lg },
  desktopFields: { flex: 1, minWidth: 0, maxWidth: metrics.readingMaxWidth },
  title: { ...typography.brandHeadline, color: colors.onSurface },
  description: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
});
