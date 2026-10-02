import { StyleSheet, Text, View } from 'react-native';
import type { BookRequest } from '../../../model/entities/BookRequest';
import { meetingWhen } from '../../../model/services/bookRequestFormat';
import { colors, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

/** Resumo do encontro (Figma 06.05): dia e horário, depois o local, cada um com seu ícone. */
export function MeetingCard({
  request,
  highlighted = false,
}: {
  request: Pick<BookRequest, 'publicLocation' | 'meetingDate' | 'meetingTime'>;
  /** Encontro já combinado: fundo verde claro, como no Figma 06.06. */
  highlighted?: boolean;
}) {
  return (
    <View style={[styles.card, highlighted && styles.highlighted]}>
      <View style={styles.item} accessible accessibilityLabel={`Quando: ${meetingWhen(request)}`}>
        <AppIcon name="calendar" size={20} color={colors.onSurfaceVariant} />
        <View style={styles.text}>
          <Text style={styles.title}>{meetingWhen(request)}</Text>
          <Text style={styles.body}>Chegue alguns minutos antes</Text>
        </View>
      </View>
      <View style={styles.item} accessible accessibilityLabel={`Onde: ${request.publicLocation}`}>
        <AppIcon name="place" size={20} color={colors.onSurfaceVariant} />
        <View style={styles.text}>
          <Text style={styles.title}>{request.publicLocation}</Text>
          <Text style={styles.body}>Local público combinado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    backgroundColor: colors.container,
  },
  highlighted: { backgroundColor: colors.selected },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56 },
  text: { flex: 1 },
  title: { ...typography.bodyLarge, color: colors.onSurface },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});
