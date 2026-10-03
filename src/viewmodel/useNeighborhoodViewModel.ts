import { useCallback, useEffect, useState } from 'react';
import { toProfileError } from '../model/entities/Profile.ts';
import type { ProfileRepository } from '../model/repositories/ProfileRepository';
import {
  SERVICE_CITY,
  SUGGESTED_NEIGHBORHOODS,
  normalizeNeighborhood,
  profileErrorMessage,
  validateNeighborhood,
} from '../model/services/neighborhood.ts';
import { useAsyncAction } from './useAsyncAction.ts';

/** Opção marcada na lista de Seu bairro (01.17): um bairro sugerido ou "Outro bairro…". */
export type NeighborhoodChoice = (typeof SUGGESTED_NEIGHBORHOODS)[number] | 'other' | null;

const isSuggested = (name: string): name is (typeof SUGGESTED_NEIGHBORHOODS)[number] =>
  (SUGGESTED_NEIGHBORHOODS as readonly string[]).includes(name);

/**
 * Bairro do perfil, usado por Seu bairro (Figma 01.17, lista com rádio) e por
 * Escolher bairro (Figma 11.01, campo de texto).
 */
export function useNeighborhoodViewModel(
  repository: ProfileRepository,
  { onSaved }: { onSaved: () => void },
) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | undefined>();
  const [choice, setChoice] = useState<NeighborhoodChoice>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, run] = useAsyncAction();

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const profile = await repository.getProfile();
      const current = profile.neighborhood ?? '';
      setText(current);
      setChoice(current ? (isSuggested(current) ? current : 'other') : null);
      setStatus('ready');
    } catch (failure) {
      setLoadError(profileErrorMessage(toProfileError(failure).code));
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = choice && choice !== 'other' ? choice : text;

  return {
    status,
    loadError,
    retry: load,
    city: SERVICE_CITY.label,
    suggestions: SUGGESTED_NEIGHBORHOODS,
    choice,
    /** Texto do campo: o bairro digitado em "Outro bairro…" ou em Escolher bairro. */
    text,
    value,
    error,
    saving,
    choose: (next: Exclude<NeighborhoodChoice, null>) => {
      setChoice(next);
      setError(undefined);
      if (next === 'other' && isSuggested(text)) setText('');
    },
    setText: (next: string) => {
      setText(next);
      // Digitar troca a escolha da lista pelo texto (11.01 não tem lista).
      setChoice((current) => (current === 'other' ? 'other' : null));
      setError(undefined);
    },
    save: () =>
      run(async () => {
        const invalid = validateNeighborhood(value);
        setError(invalid);
        if (invalid) return;
        try {
          await repository.setNeighborhood(normalizeNeighborhood(value));
          onSaved();
        } catch (failure) {
          setError(profileErrorMessage(toProfileError(failure).code));
        }
      }),
  };
}
