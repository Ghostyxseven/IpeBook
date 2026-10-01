import { useEffect, useState } from 'react';

export const RESEND_SECONDS = 60;

/** Contagem regressiva para "Reenviar código", respeitando o limite de envios do Supabase. */
export function useResendCooldown(initial = RESEND_SECONDS) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  return { seconds, restart: () => setSeconds(RESEND_SECONDS) };
}
