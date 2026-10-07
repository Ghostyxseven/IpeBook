import { useState } from 'react';
import { toLocationError } from '../model/entities/Location.ts';
import type { DeviceLocator } from '../model/repositories/DeviceLocator';
import { locationErrorMessage, neighborhoodFromAddress } from '../model/services/neighborhood.ts';
import { useAsyncAction } from './useAsyncAction.ts';

/** Permitir localização (Figma 11.02): acha o bairro pela localização aproximada. */
export function useLocateNeighborhoodViewModel(
  locator: DeviceLocator,
  { onFound }: { onFound: (neighborhood: string) => void },
) {
  const [error, setError] = useState<string | undefined>();
  const [locating, run] = useAsyncAction();
  return {
    error,
    locating,
    locate: () =>
      run(async () => {
        setError(undefined);
        try {
          onFound(neighborhoodFromAddress(await locator.currentAddress()));
        } catch (failure) {
          setError(locationErrorMessage(toLocationError(failure).code));
        }
      }),
  };
}
