import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * "Reduzir Transparência" dos Ajustes do iPhone.
 *
 * A referência do design system é clara: com a opção ligada, o Liquid Glass vira
 * superfície sólida. Só o iOS tem esse ajuste; nas outras plataformas o app já usa
 * superfícies sólidas, então o valor é `true` e o vidro nunca entra.
 */
export function useReduceTransparency() {
  const [reduce, setReduce] = useState(Platform.OS !== 'ios');

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then(
      (enabled) => active && setReduce(enabled),
      // Sem resposta do sistema, o lado seguro é o sólido: legível em qualquer caso.
      () => active && setReduce(true),
    );
    const listener = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduce);
    return () => {
      active = false;
      listener.remove();
    };
  }, []);

  return reduce;
}
