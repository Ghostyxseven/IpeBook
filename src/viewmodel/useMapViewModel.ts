import { useCallback, useEffect, useState } from 'react';
import { validCoordinates } from '../model/services/meetingPoints.ts';
import type { Coordinates } from '../model/entities/MeetingPoint';

export function useMapViewModel(
  onPoint?: (point: Coordinates) => void,
  onSelect?: (id: string) => void,
) {
  const rawToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';
  // Recusa token secreto mesmo que colocado por engano na variável pública.
  const token = /^pk\.[A-Za-z0-9_.-]+$/.test(rawToken.trim()) ? rawToken.trim() : '';
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [detail, setDetail] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setStatus('loading');
    const timer = setTimeout(
      () => setStatus((value) => (value === 'loading' ? 'error' : value)),
      20000,
    );
    return () => clearTimeout(timer);
  }, [attempt]);
  const receive = useCallback(
    (message: unknown) => {
      if (!message || typeof message !== 'object') return;
      const event = message as {
        type?: string;
        id?: string;
        latitude?: number;
        longitude?: number;
      };
      if (event.type === 'ready') setStatus('ready');
      else if (event.type === 'error') {
        setStatus('error');
        setDetail((event as { detail?: string }).detail ?? '');
      } else if (event.type === 'point' && validCoordinates(event)) onPoint?.(event);
      else if (event.type === 'select' && typeof event.id === 'string') onSelect?.(event.id);
    },
    [onPoint, onSelect],
  );
  return {
    token,
    status,
    detail,
    attempt,
    receive,
    retry: () => {
      setStatus('loading');
      setAttempt((value) => value + 1);
    },
  };
}
