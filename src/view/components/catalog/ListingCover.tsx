import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { coverIndex } from '../../../model/services/catalogFormat';
import detalheIpe from '../../../../assets/catalog/detalhe-amarelo-ipe.svg';
import ilustracaoDetalhe from '../../../../assets/catalog/ilustracao-editorial-detalhe.svg';
import ilustracaoLista from '../../../../assets/catalog/ilustracao-editorial-lista.svg';
import { coverColors, radius, spacing, typography } from '../../theme/nativeTheme';

type Variant = 'row' | 'tile' | 'detail';

/**
 * Capa do anúncio nas três variantes do Figma (03 lista, 02 Início e 04 detalhe).
 * Sem foto, mostra a capa ilustrativa: cor estável pelo id, ilustração editorial, autor e título.
 * É decorativa: título e autor já são lidos pelo card ou pela tela.
 */
export function ListingCover({
  listing,
  variant,
}: {
  listing: Pick<Listing, 'id' | 'title' | 'author' | 'coverUrl'>;
  variant: Variant;
}) {
  const frame = styles[variant];
  if (listing.coverUrl) {
    return (
      <Image
        source={{ uri: listing.coverUrl }}
        style={frame}
        contentFit="cover"
        accessible={false}
        transition={0}
      />
    );
  }
  const background =
    coverColors.backgrounds[coverIndex(listing.id, coverColors.backgrounds.length)];
  return (
    <View
      style={[
        frame,
        styles.illustrated,
        variant === 'tile' && styles.illustratedTile,
        { backgroundColor: background },
      ]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {variant === 'row' ? (
        <Image source={ilustracaoLista} style={styles.artRow} contentFit="contain" />
      ) : (
        <>
          <Text style={styles.author} numberOfLines={1}>
            {listing.author.toLocaleUpperCase('pt-BR')}
          </Text>
          {variant === 'detail' ? (
            <Image source={ilustracaoDetalhe} style={styles.artDetail} contentFit="contain" />
          ) : (
            <Image source={detalheIpe} style={styles.dot} contentFit="contain" />
          )}
          <Text
            style={variant === 'detail' ? styles.titleDetail : styles.titleTile}
            numberOfLines={2}
          >
            {listing.title}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: 80 × 112 com raio 12; o raio mais próximo nos tokens é `radius.medium`.
  row: { width: 80, height: 112, borderRadius: radius.medium, overflow: 'hidden' },
  tile: { width: '100%', height: 102, overflow: 'hidden' },
  detail: { width: 176, height: 204, borderRadius: radius.small, overflow: 'hidden' },
  illustrated: { padding: spacing.md, gap: spacing.xxs, justifyContent: 'space-between' },
  illustratedTile: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: 'flex-start',
  },
  artRow: { width: 48, height: 33.6 },
  artDetail: { width: 100, height: 70 },
  dot: { width: 20, height: 20 },
  author: { ...typography.labelMedium, color: coverColors.text },
  titleTile: { ...typography.labelMedium, color: coverColors.text },
  titleDetail: { ...typography.bodyLarge, fontWeight: '500', color: coverColors.text },
});
