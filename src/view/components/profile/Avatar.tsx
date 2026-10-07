import { StyleSheet, Text, View } from 'react-native';
import { initials } from '../../../model/services/reputationFormat';
import { AppIcon } from '../AppIcon';
import { colors, typography } from '../../theme/nativeTheme';

/**
 * O avatar monograma do Figma (03.04 e 07.03): círculo claro com as iniciais.
 *
 * Decorativo: o nome aparece em texto logo abaixo, e repeti-lo no leitor de tela
 * faria a pessoa ouvir "Ana Paula" duas vezes seguidas.
 */
export function Avatar({ name, size = 80 }: { name: string | null | undefined; size?: number }) {
  const monogram = initials(name);
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {monogram ? (
        <Text style={[styles.text, { fontSize: size / 4 }]}>{monogram}</Text>
      ) : (
        <AppIcon name="person" size={size / 2} color={colors.actionDeep} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.selected, alignItems: 'center', justifyContent: 'center' },
  text: { ...typography.titleMedium, color: colors.onSelected },
});
