import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWebLayout } from '../../hooks/useWebLayout';
import { colors, metrics, radius, spacing, typography, webLayout } from '../../theme/nativeTheme';
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
  titleSize = 'display',
  withoutHeader = false,
  children,
  footer,
}: {
  title: string;
  /** Trecho final do título com o marca-texto amarelo (ex.: "acesso."). */
  highlight?: string;
  description?: string;
  /** Mostra o logotipo acima do título, como nas telas de entrada do Figma. */
  brand?: boolean;
  /** 'headline' (30/36) no cadastro, como no Figma 01.03; 'display' (36/41) nas demais. */
  titleSize?: 'display' | 'headline';
  /**
   * Tela sem cabeçalho de navegação (ex.: Entrar): reserva a área segura do topo para o
   * logotipo não ficar embaixo da barra de status ou do recorte da câmera.
   */
  withoutHeader?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const fullTitle = highlight ? `${title} ${highlight}` : title;
  const { large } = useWebLayout();
  return (
    <SafeAreaView
      style={styles.safe}
      edges={withoutHeader ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, large && styles.desktopScroll]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.frame, large && styles.desktopFrame]}>
            {large && (
              <View style={styles.brandPanel}>
                <Wordmark />
                <View style={styles.brandStory}>
                  <Text style={styles.brandTitle}>Boas histórias circulam por perto.</Text>
                  <Text style={styles.brandDescription}>
                    Encontre livros na sua região e combine vendas, trocas ou doações com outras
                    pessoas.
                  </Text>
                </View>
                <Image
                  source={require('../../../../assets/images/boas-vindas-classicos.png')}
                  resizeMode="contain"
                  style={styles.brandBooks}
                  accessibilityLabel="Capas ilustrativas de três livros clássicos"
                />
              </View>
            )}
            <View style={[styles.content, large && styles.desktopContent]}>
              {brand && !large && <Wordmark />}
              <View style={styles.header}>
                <Text
                  style={[styles.title, titleSize === 'headline' && typography.brandHeadline]}
                  accessibilityRole="header"
                  accessibilityLabel={fullTitle}
                >
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
  desktopScroll: { justifyContent: 'center' },
  frame: { width: '100%', alignSelf: 'center', alignItems: 'center' },
  desktopFrame: {
    maxWidth: webLayout.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xl,
  },
  brandPanel: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.containerLow,
    borderRadius: radius.extraLarge,
    padding: spacing.xxl,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  brandStory: { gap: spacing.md },
  brandTitle: { ...typography.brandDisplay, color: colors.onSurface },
  brandDescription: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  brandBooks: { width: '100%', height: spacing.xxl * 6, alignSelf: 'center' },
  content: { width: '100%', maxWidth: metrics.formMaxWidth, alignSelf: 'center', gap: spacing.lg },
  desktopContent: { flex: 1, justifyContent: 'center', paddingVertical: spacing.xl },
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
