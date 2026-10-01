import type { Modality } from '../../../model/entities/Listing';

const modalities: readonly Modality[] = ['sale', 'trade', 'donation'];

/** Lê a modalidade vinda da rota, ignorando valores desconhecidos. */
export function parseModality(value: string | string[] | undefined): Modality | null {
  const text = Array.isArray(value) ? value[0] : value;
  return modalities.find((modality) => modality === text) ?? null;
}

/** Parâmetros do Explorar; `atalho` muda a cada toque para reaplicar o mesmo filtro. */
export function exploreHref(modality: Modality | null) {
  return {
    pathname: '/explorar' as const,
    params: { ...(modality ? { modalidade: modality } : {}), atalho: String(Date.now()) },
  };
}
