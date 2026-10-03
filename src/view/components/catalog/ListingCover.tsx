import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { coverIndex } from '../../../model/services/catalogFormat';
import motivoEstrelas from '../../../../assets/catalog/capa-motivo-estrelas.svg';
import motivoIpe from '../../../../assets/catalog/capa-motivo-ipe.svg';
import motivoOndas from '../../../../assets/catalog/capa-motivo-ondas.svg';
import { BRAND_FONT, coverColors } from '../../theme/nativeTheme';

type Variant = 'shelf' | 'row' | 'tile' | 'detail';

/** Largura da capa em cada uso; a altura segue a proporção 96 × 136 do Figma. */
const widths: Record<Variant, number> = { shelf: 56, row: 68, tile: 92, detail: 120 };

/** Motivo de cada cor de capa, na mesma ordem de `coverColors.backgrounds` (Figma, "Capa ilustrativa"). */
const motifs = [motivoEstrelas, motivoOndas, motivoIpe];

/**
 * Capa do anúncio no formato de livro do Figma ("Capa ilustrativa", 39:1546): lombada, moldura,
 * autor, motivo e título em serifa. Com foto, a foto ocupa o mesmo formato.
 * É decorativa: título e autor já são lidos pelo card ou pela tela.
 */
export function ListingCover({
  listing,
  variant,
}: {
  listing: Pick<Listing, 'id' | 'title' | 'author' | 'coverUrl'>;
  variant: Variant;
}) {
  const width = widths[variant];
  // Todas as medidas do Figma foram desenhadas para 96 de largura.
  const s = width / 96;
  const frame = {
    width,
    height: 136 * s,
    borderTopLeftRadius: 2.4 * s,
    borderBottomLeftRadius: 2.4 * s,
    borderTopRightRadius: 6.4 * s,
    borderBottomRightRadius: 6.4 * s,
  };

  if (listing.coverUrl) {
    return (
      <View style={[styles.book, frame]} accessible={false}>
        <Image
          source={{ uri: listing.coverUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessible={false}
          transition={0}
        />
        <View style={[styles.spine, { width: 8 * s }]} />
      </View>
    );
  }

  const index = coverIndex(listing.id, coverColors.backgrounds.length);
  return (
    <View
      style={[styles.book, frame, { backgroundColor: coverColors.backgrounds[index] }]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.spine, { width: 8 * s }]} />
      <View
        style={[
          styles.frame,
          {
            left: 12.8 * s,
            top: 5.6 * s,
            width: 78.4 * s,
            height: 124.8 * s,
            borderWidth: 0.8 * s,
            borderRadius: 4 * s,
          },
        ]}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.author,
          {
            left: 17.6 * s,
            right: 8 * s,
            top: 11.2 * s,
            fontSize: 7.2 * s,
            lineHeight: 12.8 * s,
            letterSpacing: 0.576 * s,
          },
        ]}
      >
        {listing.author.toLocaleUpperCase('pt-BR')}
      </Text>
      <Image
        source={motifs[index % motifs.length]}
        style={{ position: 'absolute', left: 0, top: 35.2 * s, width, height: 56 * s }}
        contentFit="contain"
        accessible={false}
      />
      <Text
        numberOfLines={2}
        style={[
          styles.title,
          {
            left: 17.6 * s,
            right: 8 * s,
            bottom: 8 * s,
            fontSize: 12 * s,
            lineHeight: 14.4 * s,
          },
        ]}
      >
        {listing.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  book: {
    overflow: 'hidden',
    // Sombra da capa no Figma: 0 3.2 8 rgba(0,0,0,0.18).
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  // Lombada: faixa escura à esquerda que dá volume ao livro.
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  frame: { position: 'absolute', borderColor: coverColors.text },
  author: { position: 'absolute', fontWeight: '500', color: coverColors.text, opacity: 0.85 },
  title: { position: 'absolute', fontFamily: BRAND_FONT, color: coverColors.text },
});
