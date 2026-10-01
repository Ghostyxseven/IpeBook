import { useEffect, useRef, type RefObject } from 'react';
import type { AccessIntent } from '../../model/entities/Institutional';
import { Icon } from './Icon';
import { useScrollLock } from '../hooks/useScrollLock';
import { instagram } from '../../model/services/institutional.ts';

export function AccessDialog({
  intent,
  onClose,
  fallbackFocus,
}: {
  intent: AccessIntent | null;
  onClose: () => void;
  fallbackFocus: RefObject<HTMLButtonElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useScrollLock(Boolean(intent));
  useEffect(() => {
    const dialog = ref.current;
    if (!intent || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected && previous !== document.body && previous.getClientRects().length) {
        previous.focus();
      } else if (fallbackFocus.current?.getClientRects().length) {
        fallbackFocus.current.focus();
      }
    };
  }, [intent, fallbackFocus]);
  return (
    <dialog
      ref={ref}
      className="access-dialog"
      aria-labelledby="access-title"
      aria-describedby="access-description"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="icon-button dialog-close"
        aria-label="Fechar aviso"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <span className="feature-icon">
        <Icon name="leaf" size={28} />
      </span>
      <p className="eyebrow">Estamos preparando o próximo capítulo</p>
      <h2 id="access-title">
        {intent === 'criar' ? 'Sua conta vem em breve.' : 'O IpêBook está chegando.'}
      </h2>
      <p id="access-description">
        O acesso e o cadastro ainda não estão disponíveis. Por enquanto, você pode conhecer a
        proposta e como queremos conectar leitores de Piripiri.
      </p>
      <button type="button" className="button primary" onClick={onClose}>
        Continuar conhecendo
      </button>
      <a
        className="button secondary"
        href={instagram.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Acompanhe no Instagram
      </a>
      <a className="text-link" href="#privacidade" onClick={onClose}>
        Ler a Política de Privacidade
      </a>
    </dialog>
  );
}
