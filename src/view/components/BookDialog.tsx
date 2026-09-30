import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

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
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
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
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input, select, [tabindex="0"]',
          ),
        ];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
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
