import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme/nativeTheme';

/**
 * Capa do anúncio na proporção 2:3. Sem imagem, mostra a inicial do título;
 * é decorativa porque o título já é lido junto com o card.
 */
export function ListingCover({
  uri,
  title,
  width,
}: {
  uri: string | null;
  title: string;
  width: number;
}) {
  const size = { width, height: Math.round(width * 1.5) };
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.cover, size]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessible={false}
      />
    );
  }
  return (
    <View
      style={[styles.cover, styles.placeholder, size]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={styles.initial}>{title.trim().charAt(0).toUpperCase() || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { borderRadius: radius.small, backgroundColor: colors.soft },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initial: { ...typography.title, color: colors.actionDeep },
});
