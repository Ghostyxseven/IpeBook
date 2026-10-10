/** Ponto público escolhido explicitamente; nunca derivado da posição da pessoa. */
export type MeetingPoint = { name: string; latitude: number; longitude: number };
export type Coordinates = Pick<MeetingPoint, 'latitude' | 'longitude'>;
