import { useState } from 'react';
import type { User } from '../model/entities/User';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import type { ListingsRepository } from '../model/repositories/ListingsRepository';
import type { ProfileRepository } from '../model/repositories/ProfileRepository';
import type { ReputationRepository } from '../model/repositories/ReputationRepository';
import { myDataExportText } from '../model/services/exportMyData';
import { useAsyncAction } from './useAsyncAction';

export type ExportMyDataRepositories = {
  profile: ProfileRepository;
  listings: ListingsRepository;
  bookRequests: BookRequestRepository;
  reputation: ReputationRepository;
};

/**
 * "Baixar meus dados" (Figma 07.07): busca o que o app guarda da pessoa e devolve o texto
 * pronto. Quem compartilha o arquivo é a tela (`Share` é React Native, o viewmodel não
 * conhece isso, ADR 0012) — por isso `prepare` só devolve o texto ou `null` no erro.
 */
export function useExportMyDataViewModel(repositories: ExportMyDataRepositories, user: User) {
  const [preparing, run] = useAsyncAction();
  const [error, setError] = useState<string | undefined>();

  const prepare = async (): Promise<string | null> => {
    let text: string | null = null;
    await run(async () => {
      setError(undefined);
      try {
        const [
          profile,
          listings,
          sentRequests,
          receivedRequests,
          publicProfile,
          ratingsReceived,
          history,
        ] = await Promise.all([
          repositories.profile.getProfile(),
          repositories.listings.listMine(),
          repositories.bookRequests.getRequestsByRequester(user.id),
          repositories.bookRequests.getRequestsByOwner(user.id),
          repositories.reputation.getPublicProfile(user.id),
          repositories.reputation.listRatingsReceived(user.id),
          repositories.reputation.listMyHistory(),
        ]);
        text = myDataExportText({
          user,
          profile,
          listings,
          sentRequests,
          receivedRequests,
          publicProfile,
          ratingsReceived,
          history,
        });
      } catch {
        setError('Não deu para preparar seus dados agora. Tente de novo em instantes.');
      }
    });
    return text;
  };

  return { preparing, error, prepare };
}
