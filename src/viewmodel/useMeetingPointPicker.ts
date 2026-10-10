import { useState } from 'react';
import type { Coordinates, MeetingPoint } from '../model/entities/MeetingPoint';
import {
  readMeetingPoint,
  validMeetingPoint,
  validCoordinates,
} from '../model/services/meetingPoints.ts';

/** Só confirma ponto com nome e declaração explícita; cancelar não altera o formulário. */
export function useMeetingPointPicker(
  value: MeetingPoint | null,
  onChange: (point: MeetingPoint | null) => void,
) {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const open = () => {
    setName(value?.name ?? '');
    setLatitude(value ? String(value.latitude) : '');
    setLongitude(value ? String(value.longitude) : '');
    setConfirmed(false);
    setOpened(true);
  };
  const point =
    latitude.trim() && longitude.trim()
      ? readMeetingPoint({
          name,
          latitude: Number(latitude.replace(',', '.')),
          longitude: Number(longitude.replace(',', '.')),
        })
      : null;
  const candidate = {
    latitude: Number(latitude.replace(',', '.')),
    longitude: Number(longitude.replace(',', '.')),
  };
  const coordinates =
    latitude.trim() && longitude.trim() && validCoordinates(candidate) ? candidate : null;
  const canConfirm = confirmed && validMeetingPoint(point);
  return {
    opened,
    open,
    close: () => setOpened(false),
    name,
    setName: (next: string) => {
      setName(next);
      setConfirmed(false);
    },
    latitude,
    setLatitude: (next: string) => {
      setLatitude(next);
      setConfirmed(false);
    },
    longitude,
    setLongitude: (next: string) => {
      setLongitude(next);
      setConfirmed(false);
    },
    coordinates,
    confirmed,
    toggleConfirmed: () => setConfirmed((v) => !v),
    point,
    canConfirm,
    select: (coordinates: Coordinates) => {
      setLatitude(coordinates.latitude.toFixed(6));
      setLongitude(coordinates.longitude.toFixed(6));
      setConfirmed(false);
    },
    confirm: () => {
      if (canConfirm && point) {
        onChange(point);
        setOpened(false);
      }
    },
  };
}
