import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Coordinates } from '../../../model/entities/MeetingPoint';
import { useMapViewModel } from '../../../viewmodel/useMapViewModel';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';
import { MapSurface } from './MapSurface';
import type { MapMarker } from './mapRuntime';
import { mapCss } from './mapStyle';
const noMarkers: MapMarker[] = [];

export function PublicMap({
  markers = noMarkers,
  point = null,
  onPoint,
  onSelect,
  scrollable = true,
}: {
  markers?: MapMarker[];
  point?: Coordinates | null;
  onPoint?: (point: Coordinates) => void;
  onSelect?: (id: string) => void;
  /** Mapa embutido em algo rolável (ScrollView/Modal rolável)? Padrão true, o caso mais comum. */
  scrollable?: boolean;
}) {
  const vm = useMapViewModel(onPoint, onSelect);
  const data = useMemo(() => ({ markers, point }), [markers, point]);
  const config = {
    ...data,
    token: vm.token,
    selectable: Boolean(onPoint),
    css: mapCss,
    color: colors.action,
    scrollable,
    padding: {
      top: metrics.touchTarget * 2 + spacing.md,
      bottom: spacing.xxl,
      left: spacing.xxl,
      right: spacing.xxl + spacing.md,
    },
  };
  return (
    <View style={styles.wrapper}>
      {!vm.token ? (
        <Text style={styles.message}>
          O mapa ainda não está disponível. Você pode continuar sem marcar um ponto.
        </Text>
      ) : (
        <>
          <View style={styles.map}>
            <MapSurface key={vm.attempt} config={config} data={data} onEvent={vm.receive} />
          </View>
          {vm.status !== 'ready' ? (
            <View style={styles.feedback} accessibilityLiveRegion="polite">
              <Text style={styles.message}>
                {vm.status === 'loading'
                  ? 'Carregando mapa…'
                  : 'Não foi possível carregar o mapa. Confira a conexão ou continue pela lista.'}
              </Text>
              {vm.status === 'error' ? (
                <Button
                  label="Tentar carregar mapa novamente"
                  variant="secondary"
                  onPress={vm.retry}
                />
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  map: {
    height: spacing.xxl * 7,
    overflow: 'hidden',
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.container,
  },
  feedback: { gap: spacing.xs },
  message: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});
