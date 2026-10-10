import { useCallback, useEffect, useRef, type ElementRef } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Mapbox, { Camera, MapView, MarkerView } from '@rnmapbox/maps';
import type { MapSurfaceProps } from './MapSurface.types';
import { colors, coverColors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Mapa abre em Piripiri (ADR 0036); nunca deriva do GPS nem do perfil. */
const DEFAULT_CENTER: [number, number] = [-41.776, -4.273];

type PressFeature = { geometry: { coordinates: number[] } };

/** SDK nativo do Mapbox (Android/iOS); a Web usa mapbox-gl em MapSurface.web.tsx. */
export function MapSurface({ config, data, onEvent }: MapSurfaceProps) {
  const camera = useRef<ElementRef<typeof Camera>>(null);
  const lastIds = useRef('');
  useEffect(() => {
    Mapbox.setAccessToken(config.token || null).catch(() => onEvent({ type: 'error' }));
  }, [config.token, onEvent]);

  useEffect(() => {
    const ids = JSON.stringify(data.markers.map((marker) => marker.id));
    if (ids === lastIds.current || data.markers.length === 0) return;
    lastIds.current = ids;
    if (data.markers.length === 1) {
      camera.current?.setCamera({
        centerCoordinate: [data.markers[0].longitude, data.markers[0].latitude],
        zoomLevel: 14,
        animationDuration: 0,
      });
      return;
    }
    const lats = data.markers.map((marker) => marker.latitude);
    const lngs = data.markers.map((marker) => marker.longitude);
    camera.current?.fitBounds(
      [Math.max(...lngs), Math.max(...lats)],
      [Math.min(...lngs), Math.min(...lats)],
      [config.padding.top, config.padding.right, config.padding.bottom, config.padding.left],
      0,
    );
  }, [data.markers, config.padding]);

  const handlePress = useCallback(
    (feature: PressFeature) => {
      if (!config.selectable) return;
      const [longitude, latitude] = feature.geometry.coordinates;
      if (typeof latitude === 'number' && typeof longitude === 'number')
        onEvent({ type: 'point', latitude, longitude });
    },
    [config.selectable, onEvent],
  );

  return (
    <MapView
      style={styles.map}
      styleURL={Mapbox.StyleURL.Street}
      scaleBarEnabled={false}
      onDidFinishLoadingMap={() => onEvent({ type: 'ready' })}
      onMapLoadingError={() => onEvent({ type: 'error' })}
      onPress={handlePress}
    >
      <Camera
        ref={camera}
        defaultSettings={{
          centerCoordinate: data.point
            ? [data.point.longitude, data.point.latitude]
            : DEFAULT_CENTER,
          zoomLevel: 13,
        }}
        animationDuration={0}
      />
      {data.markers.map((item) => (
        <MarkerView
          key={item.id}
          coordinate={[item.longitude, item.latitude]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => onEvent({ type: 'select', id: item.id })}
            style={styles.markerButton}
          >
            <View style={styles.cover}>
              {item.coverUrl ? (
                <Image
                  source={{ uri: item.coverUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              ) : (
                <Text numberOfLines={3} style={styles.coverText}>
                  {item.title}
                </Text>
              )}
            </View>
            {item.count > 1 ? (
              <View style={styles.count}>
                <Text style={styles.countText}>{item.count}</Text>
              </View>
            ) : null}
          </Pressable>
        </MarkerView>
      ))}
      {data.point ? (
        <MarkerView
          coordinate={[data.point.longitude, data.point.latitude]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={[styles.pin, { backgroundColor: config.color }]} />
        </MarkerView>
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  markerButton: {
    minWidth: metrics.touchTarget,
    minHeight: metrics.touchTarget,
    padding: spacing.xs,
    alignItems: 'center',
  },
  cover: {
    width: metrics.touchTarget,
    height: metrics.touchTarget + spacing.lg,
    borderRadius: radius.small,
    backgroundColor: coverColors.backgrounds[2],
    borderLeftWidth: metrics.borderStrong,
    borderLeftColor: colors.actionDeep,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: {
    ...typography.bodyMedium,
    color: coverColors.text,
    padding: spacing.xxs,
    textAlign: 'center',
  },
  count: {
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: radius.full,
    backgroundColor: colors.action,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  countText: { ...typography.bodyMedium, color: colors.surface, fontWeight: 'bold' },
  pin: { width: spacing.lg, height: spacing.lg, borderRadius: radius.full },
});
