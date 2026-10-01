import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { useScrollLock } from '../hooks/useScrollLock';

export function BookDialog({
  open,
  onClose,
  titleId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected && !previous.closest('[inert]'))
        previous.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="book-dialog"
      aria-labelledby={titleId}
      onCancel={() => close.current()}
      onClick={(event) => {
        if (event.target === event.currentTarget) close.current();
      }}
    >
      <button
        type="button"
        className="icon-button dialog-close"
        aria-label="Fechar janela"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  );
}
