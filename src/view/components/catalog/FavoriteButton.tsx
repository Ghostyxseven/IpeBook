import { Pressable, StyleSheet } from 'react-native';
import { colors, metrics, radius } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

/**
 * Coração de favoritar (Figma 37), nos Book Cards e no Detalhe. Fica sozinho — a
 * tela ainda abre pelo resto do card — então o alvo de 48 px sai do texto para não
 * competir com o toque de "abrir detalhes".
 */
export function FavoriteButton({
  favorite,
  onToggle,
  title,
  overlay = false,
}: {
  favorite: boolean;
  onToggle: () => void;
  /** Para o rótulo acessível: "Favoritar Dom Casmurro" / "Remover Dom Casmurro dos favoritos". */
  title: string;
  /** Sobre a capa ilustrativa (Figma 02.01): fundo translúcido para garantir contraste
   * com qualquer cor de capa, em vez do pressed cinza do botão em lista. */
  overlay?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favorite ? `Remover ${title} dos favoritos` : `Favoritar ${title}`}
      accessibilityState={{ selected: favorite }}
      onPress={onToggle}
      hitSlop={8}
      style={({ pressed }) => [styles.button, overlay && styles.overlay, pressed && styles.pressed]}
    >
      <AppIcon
        name={favorite ? 'heartFill' : 'heart'}
        size={22}
        color={favorite ? colors.error : colors.onSurfaceVariant}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { backgroundColor: 'rgba(255, 255, 255, 0.75)' },
  pressed: { backgroundColor: colors.pressed },
});
