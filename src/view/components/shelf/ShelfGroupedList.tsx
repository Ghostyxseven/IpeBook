import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, metrics } from '../../theme/nativeTheme';

/**
 * Lista agrupada do iOS para as linhas da Estante (Figma 05.01, 05.03 e 05.04, iOS):
 * cantos de 12, fundo `ios-cell` e separador fino recuado, como a lista agrupada já
 * usada em `RadioGroup` (`src/view/components/ui/RadioListItem.tsx`). Só para iPhone —
 * Android e Web continuam com a lista solta de `ShelfBookRow`.
 */
export function ShelfGroupedList({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <View style={styles.group}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={styles.separator} /> : null}
          {item}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: metrics.fieldRadius,
    overflow: 'hidden',
    backgroundColor: colors.iosCell,
  },
  // Recuo até o texto: 16 (margem) + 56 (capa, variante "shelf") + 16 (vão) = 88.
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 88,
    backgroundColor: colors.iosSeparator,
  },
});
