/**
 * Monta as dependências reais de negociação (padrão Factory da disciplina).
 * As telas usam estes hooks e não conhecem o Supabase.
 */
import { createSupabaseBookRequestRepository } from '../model/repositories/supabaseBookRequestRepository';
import { supabase } from '../infra/supabaseClient';
import { catalogRepository } from './catalog';
import { createSupabaseMessageRepository } from '../model/repositories/supabaseMessageRepository';

/** A mesma conversa da spec 029; criada aqui para a lista não depender de `messages.ts`. */
const messageRepository = createSupabaseMessageRepository(supabase);
import { useBookRequestDetailViewModel } from '../viewmodel/useBookRequestDetailViewModel';
import { useBookRequestListViewModel } from '../viewmodel/useBookRequestListViewModel';
import { useCreateBookRequestViewModel } from '../viewmodel/useCreateBookRequestViewModel';
import { useProposeMeetingViewModel } from '../viewmodel/useProposeMeetingViewModel';
import { useRescheduleViewModel } from '../viewmodel/useRescheduleViewModel';
import { useStartConversationViewModel } from '../viewmodel/useStartConversationViewModel';
import { useSessionContext } from '../viewmodel/useSession';
import { listingsRepository } from './listings';

export const bookRequestRepository = createSupabaseBookRequestRepository(supabase);

export const useCreateBookRequest = (listingId: string) =>
  useCreateBookRequestViewModel(
    catalogRepository,
    bookRequestRepository,
    listingId,
    listingsRepository,
  );

export const useBookRequestDetail = (id: string) =>
  useBookRequestDetailViewModel(catalogRepository, bookRequestRepository, id);

export const useBookRequestList = () =>
  useBookRequestListViewModel(bookRequestRepository, catalogRepository, messageRepository);

/** Reagendar o encontro combinado (Figma 06.13 e 06.14). */
export const useReschedule = (id: string) => {
  const session = useSessionContext();
  return useRescheduleViewModel(
    bookRequestRepository,
    catalogRepository,
    id,
    session.user?.id ?? '',
  );
};

/** Propor o primeiro encontro de uma conversa, antes do aceite (ADR 0035). */
export const useProposeMeeting = (id: string) => {
  const session = useSessionContext();
  return useProposeMeetingViewModel(
    bookRequestRepository,
    catalogRepository,
    id,
    session.user?.id ?? '',
  );
};

/** "Conversar" (ADR 0035): abre uma negociação sem encontro, só para falar antes. */
export const useStartConversation = (listingId: string) =>
  useStartConversationViewModel(bookRequestRepository, listingId);
