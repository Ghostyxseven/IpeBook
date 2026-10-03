import { useCallback, useEffect, useRef, useState } from 'react';
import type { BookRequest } from '../model/entities/BookRequest';
import { toBookRequestError } from '../model/entities/BookRequestError.ts';
import type { Listing } from '../model/entities/Listing';
import { toMessageError } from '../model/entities/MessageError.ts';
import type { RequestMessage } from '../model/entities/RequestMessage';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import type { MessageRepository } from '../model/repositories/MessageRepository';
import { bookRequestErrorMessage } from '../model/services/bookRequestMessages.ts';
import {
  isConversationOpen,
  messageErrorMessage,
  normalizeMessage,
} from '../model/services/messageFormat.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export type ConversationStatus = 'loading' | 'ready' | 'notFound' | 'error';

/**
 * Conversa de uma negociação (Figma 06.02, 06.10 e 06.16): o livro no topo, as mensagens
 * e o campo de envio. Mensagem que falha volta para o campo, com o aviso do 06.10.
 */
export function useConversationViewModel(
  messages: MessageRepository,
  requests: BookRequestRepository,
  catalog: CatalogRepository,
  requestId: string,
  userId: string,
) {
  const [status, setStatus] = useState<ConversationStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [request, setRequest] = useState<BookRequest | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [otherName, setOtherName] = useState<string | null>(null);
  const [items, setItems] = useState<RequestMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, run] = useAsyncAction();
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const current = ++loadId.current;
    setStatus('loading');
    setLoadError(null);
    try {
      const found = await requests.getRequestById(requestId);
      const [book, list] = await Promise.all([
        catalog.getById(found.listingId).catch(() => null),
        messages.listByRequest(requestId),
      ]);
      const asRequester = found.requesterId === userId;
      const otherId = asRequester ? book?.ownerId : found.requesterId;
      const name = asRequester && book?.ownerFirstName ? book.ownerFirstName : null;
      const resolved = name ?? (otherId ? await messages.firstName(otherId) : null);
      if (current !== loadId.current) return;
      setRequest(found);
      setListing(book);
      setOtherName(resolved);
      setItems(list);
      setStatus('ready');
    } catch (failure) {
      if (current !== loadId.current) return;
      const asRequest = toBookRequestError(failure);
      if (asRequest.code === 'not_found') {
        setStatus('notFound');
        setLoadError(bookRequestErrorMessage('not_found'));
        return;
      }
      setStatus('error');
      setLoadError(
        asRequest.code === 'unknown'
          ? messageErrorMessage(toMessageError(failure).code)
          : bookRequestErrorMessage(asRequest.code),
      );
    }
  }, [messages, requests, catalog, requestId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Busca mensagens novas sem trocar a tela por "carregando". */
  const refresh = useCallback(async () => {
    try {
      const list = await messages.listByRequest(requestId);
      setItems(list);
    } catch {
      // Sem conexão a conversa continua como está; o próximo envio mostra o aviso.
    }
  }, [messages, requestId]);

  const send = useCallback(
    () =>
      run(async () => {
        const body = normalizeMessage(draft);
        if (!body) return;
        setSendError(null);
        try {
          const sent = await messages.send(requestId, body);
          setItems((current) => [...current, sent]);
          setDraft('');
        } catch (failure) {
          // O texto fica no campo para tentar de novo (Figma 06.10).
          setSendError(messageErrorMessage(toMessageError(failure).code));
        }
      }),
    [run, draft, messages, requestId],
  );

  return {
    status,
    loadError,
    retry: load,
    refresh,
    request,
    listing,
    otherName,
    open: request ? isConversationOpen(request.status) : false,
    messages: items,
    isMine: (message: RequestMessage) => message.senderId === userId,
    draft,
    setDraft: (value: string) => {
      setDraft(value);
      if (sendError) setSendError(null);
    },
    canSend: Boolean(normalizeMessage(draft)) && !sending,
    sending,
    sendError,
    send,
  };
}
