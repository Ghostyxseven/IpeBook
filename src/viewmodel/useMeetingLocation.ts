import { useCallback, useState } from 'react';
import type { MeetingPoint } from '../model/entities/MeetingPoint';
import { readMeetingPoint } from '../model/services/meetingPoints.ts';

export function useMeetingLocation() {
  const [publicLocation, setName] = useState('');
  const [meetingPoint, setPoint] = useState<MeetingPoint | null>(null);
  const setPublicLocation = useCallback((name: string) => {
    setName(name);
    setPoint((previous) => (previous?.name === name.trim() ? previous : null));
  }, []);
  const chooseMeetingPoint = useCallback((value: MeetingPoint | null) => {
    const point = readMeetingPoint(value);
    setPoint(point);
    if (point) setName(point.name);
  }, []);
  return { publicLocation, setPublicLocation, meetingPoint, chooseMeetingPoint };
}
