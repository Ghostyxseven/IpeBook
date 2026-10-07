import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { useReduceTransparency } from '../../hooks/useReduceTransparency';
import { colors, glass, metrics } from '../../theme/nativeTheme';

/**
 * Liquid Glass do iPhone (referência `ios.md` e ADR 0029).
 *
 * **Onde entra:** só na camada de navegação que flutua sobre o conteúdo — barra de abas,
 * botões circulares da barra superior, controles sobre a capa. Listas, cartões, campos e
 * textos ficam em superfícies sólidas, e vidro sobre vidro não existe.
 *
 * Fora do iPhone, e com "Reduzir Transparência" ligado, vira a célula sólida do iOS. Quem
 * usa não perde contraste nenhum: o vidro é acabamento, nunca o que torna algo legível.
 */
export function GlassSurface({
  children,
  style,
  /** Sobre imagem ou câmera: fundo escuro, para ícones brancos. */
  overMedia = false,
  // O resto das props de View segue adiante: sem isso, papéis e rótulos de
  // acessibilidade se perderiam justamente no iPhone, onde o vidro entra.
  ...rest
}: ViewProps & {
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  overMedia?: boolean;
}) {
  const solid = useReduceTransparency();

  if (solid || Platform.OS !== 'ios') {
    return (
      <View style={[styles.base, { backgroundColor: colors.iosCell }, style]} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={glass.blur}
      tint={overMedia ? 'dark' : 'light'}
      style={[styles.base, styles.glass, style]}
      {...rest}
    >
      {/* O preenchimento vem do token; o desfoque sozinho não dá a cor da marca. */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: overMedia ? colors.glassFillDark : colors.glassFill },
        ]}
      />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  // `overflow: hidden` mantém o desfoque dentro do raio de quem usa o componente.
  base: { overflow: 'hidden' },
  glass: {
    borderWidth: metrics.borderHairline,
    borderColor: colors.glassStroke,
    // glass-shadow da referência: sombra suave e larga.
    shadowColor: '#281E14',
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
});
