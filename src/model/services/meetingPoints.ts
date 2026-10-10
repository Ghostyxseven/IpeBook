import type { Coordinates, MeetingPoint } from '../entities/MeetingPoint';
import type { Listing } from '../entities/Listing';

export function validCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false;
  const p = value as Coordinates;
  return (
    Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 85 &&
    Number.isFinite(p.longitude) &&
    Math.abs(p.longitude) <= 180
  );
}

export function validMeetingPoint(value: unknown): value is MeetingPoint {
  if (!validCoordinates(value)) return false;
  const p = value as MeetingPoint;
  return typeof p.name === 'string' && p.name.trim().length > 0 && p.name.trim().length <= 160;
}

/** Lê só os campos públicos do contrato, sem propagar metadados arbitrários. */
export function readMeetingPoint(value: unknown): MeetingPoint | null {
  if (!validMeetingPoint(value)) return null;
  return { name: value.name.trim(), latitude: value.latitude, longitude: value.longitude };
}

export function publicMapListings(items: Listing[]): Listing[] {
  return items.filter(
    (item) => item.status === 'disponivel' && validMeetingPoint(item.meetingPoint),
  );
}

export function sameCoordinates(a: Coordinates, b: Coordinates): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}
