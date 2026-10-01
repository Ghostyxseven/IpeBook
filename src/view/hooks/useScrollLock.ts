import { useEffect } from 'react';

// Contador compartilhado: vários diálogos abertos ao mesmo tempo não restauram a rolagem cedo demais.
let locks = 0;
let previousOverflow = '';

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (locks === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
