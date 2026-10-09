import { useCallback, useEffect, useState } from 'react';
import type { ProfileRepository } from '../model/repositories/ProfileRepository';

/**
 * Só o nome do bairro para o chip do topo (Figma 02.02), sem os formulários de
 * `useNeighborhoodViewModel`. Sem bairro salvo ainda, o chip mostra "Escolher bairro"
 * e o toque abre a mesma tela de edição.
 */
export function useMyNeighborhoodViewModel(repository: ProfileRepository) {
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const profile = await repository.getProfile();
      setNeighborhood(profile.neighborhood);
      setStatus('ready');
    } catch {
      // O chip cai para "Escolher bairro"; o erro de verdade aparece na própria tela
      // de edição, que já trata rede e configuração do Supabase.
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  return { neighborhood, status, retry: load };
}
