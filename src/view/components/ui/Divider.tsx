import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/nativeTheme';

/** Divisor com rótulo entre o login social e o formulário por e-mail (Figma 01.03 "ou"). */
export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.outlineVariant },
  label: { ...typography.labelMedium, color: colors.onSurfaceVariant },
});
