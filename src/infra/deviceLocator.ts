import * as Location from 'expo-location';
import { LocationError } from '../model/entities/Location';
import type { DeviceLocator } from '../model/repositories/DeviceLocator';

/**
 * Localização com o app aberto e precisão aproximada (cerca de 100 m): basta para achar o
 * bairro. A posição não é guardada nem enviada ao servidor; só o bairro escolhido é salvo.
 */
export const deviceLocator: DeviceLocator = {
  async currentAddress() {
    const permission = await Location.requestForegroundPermissionsAsync().catch((error) => {
      throw new LocationError('unavailable', error);
    });
    if (!permission.granted) throw new LocationError('denied');
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      return { city: address?.city ?? null, district: address?.district ?? null };
    } catch (error) {
      throw new LocationError('unavailable', error);
    }
  },
};
