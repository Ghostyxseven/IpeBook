import { useCallback, useRef, useState } from 'react';

/** Executa uma ação assíncrona por vez: evita envio duplo ao tocar várias vezes no botão. */
export function useAsyncAction() {
  const busy = useRef(false);
  const [running, setRunning] = useState(false);
  const run = useCallback(async (action: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setRunning(true);
    try {
      await action();
    } finally {
      busy.current = false;
      setRunning(false);
    }
  }, []);
  return [running, run] as const;
}
