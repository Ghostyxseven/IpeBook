/** Monta as dependências reais da conversa (padrão Factory da disciplina). */
import { supabase } from '../infra/supabaseClient';
import { createSupabaseMessageRepository } from '../model/repositories/supabaseMessageRepository';
import { useConversationViewModel } from '../viewmodel/useConversationViewModel';
import { useSessionContext } from '../viewmodel/useSession';
import { bookRequestRepository } from './bookRequest';
import { catalogRepository } from './catalog';

export const messageRepository = createSupabaseMessageRepository(supabase);

export const useConversation = (requestId: string) => {
  const session = useSessionContext();
  return useConversationViewModel(
    messageRepository,
    bookRequestRepository,
    catalogRepository,
    requestId,
    session.user?.id ?? '',
  );
};
