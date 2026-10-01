/** Web: localStorage do navegador. Pode ser bloqueado (modo privado, políticas do navegador). */
function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export const localStore = browserStorage();
