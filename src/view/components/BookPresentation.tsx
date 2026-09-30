import { Children, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useBookNavigation } from '../../viewmodel/useBookNavigation';
import { BookDialog } from './BookDialog';
import { Icon } from './Icon';
import { createBookTurn } from '../animations/bookTurn';

/** Faixas contíguas dão curvatura à folha; o conteúdo real permanece sem duplicação acessível. */
export function BookPresentation({ hash, children }: { hash: string; children: ReactNode }) {
  const vm = useBookNavigation(hash);
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const previous = useRef(vm.index);
  const controller = useRef<ReturnType<typeof createBookTurn> | null>(null);
  const latest = useRef(vm);
  latest.current = vm;
  const [gestureUsed, setGestureUsed] = useState(false);
  const keyboard = useRef(false);
  const pages = Children.toArray(children);
  const [contentsOpen, setContentsOpen] = useState(false);

  useLayoutEffect(() => {
    controller.current = createBookTurn(stage.current!, overlay.current!, {
      index: () => latest.current.index,
      reduced: () => latest.current.reducedMotion,
      navigate: (index) => latest.current.goTo(index),
      onGesture: () => setGestureUsed(true),
    });
    return () => controller.current?.destroy();
  }, []);

  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = vm.index;
    controller.current?.sync(old, vm.index, keyboard.current);
    keyboard.current = false;
    if (old !== vm.index && stage.current?.contains(document.activeElement)) {
      (stage.current.children[vm.index] as HTMLElement).focus({ preventScroll: true });
    }
  }, [vm.index, vm.reducedMotion]);

  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="book-presentation"
      onKeyDown={(event) => {
        if (
          event.target instanceof HTMLElement &&
          event.target.closest('input, textarea, select, summary, dialog, [role="dialog"]')
        )
          return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          keyboard.current =
            vm.index + (event.key === 'ArrowRight' ? 1 : -1) >= 0 &&
            vm.index + (event.key === 'ArrowRight' ? 1 : -1) < pages.length;
          vm.goTo(vm.index + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}
    >
      <div className="book-running-head">
        <span className="book-running-label">
          IpêBook <span aria-hidden="true">/</span> Um livro de possibilidades
        </span>
        <button
          type="button"
          className="book-index-trigger"
          aria-haspopup="dialog"
          onClick={() => setContentsOpen(true)}
        >
          <Icon name="menu" size={18} />
          Sumário<span className="book-index-hint">Escolha um capítulo</span>
        </button>
      </div>
      <div className="book-sheet-surface">
        <div className="book-stage" ref={stage}>
          {pages.map((page, index) => (
            <div
              key={vm.pages[index].id}
              className={`book-page ${vm.index === index ? 'is-current' : ''}`}
              inert={vm.index !== index}
              aria-hidden={vm.index !== index}
              tabIndex={-1}
              role="group"
              aria-label={`${index + 1} de ${pages.length}: ${vm.pages[index].label}`}
            >
              {page}
            </div>
          ))}
        </div>
        <div className="book-overlay" ref={overlay} aria-hidden="true" inert />
      </div>
      <nav className="book-controls" aria-label="Páginas da apresentação">
        <button
          className="book-turn"
          disabled={vm.index === 0}
          onClick={() => vm.goTo(vm.index - 1)}
          aria-label="Página anterior"
        >
          <span className="book-arrow-back">
            <Icon name="arrow" />
          </span>
          <span>Anterior</span>
        </button>
        <progress
          className="book-progress"
          max={pages.length}
          value={vm.index + 1}
          aria-label="Progresso de leitura"
        />
        <div className={`book-swipe-indicator ${gestureUsed ? 'is-used' : ''}`} aria-hidden="true">
          <span className="swipe-arrow swipe-arrow-left">‹</span>
          <span className="swipe-text">Deslize para navegar</span>
          <span className="swipe-arrow swipe-arrow-right">›</span>
        </div>
        <p aria-live="polite" aria-atomic="true">
          <span className="book-page-title">{vm.pages[vm.index].label}</span>
          <span className="book-counter">
            {String(vm.index + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
          </span>
          <span className="book-dots" aria-hidden="true">
            {pages.map((_, i) => (
              <span key={i} className={`book-dot ${i === vm.index ? 'is-active' : ''}`} />
            ))}
          </span>
        </p>
        <button
          className="book-turn"
          disabled={vm.index === pages.length - 1}
          onClick={() => vm.goTo(vm.index + 1)}
          aria-label="Próxima página"
        >
          <span>Próxima</span>
          <Icon name="arrow" />
        </button>
      </nav>
      <BookDialog
        open={contentsOpen}
        onClose={() => setContentsOpen(false)}
        titleId="contents-title"
      >
        <span className="edition-label">Seu caminho por esta história</span>
        <h2 id="contents-title">Sumário</h2>
        <p>Leia na ordem ou vá direto ao capítulo que procura.</p>
        <nav className="book-contents" aria-label="Capítulos do livro">
          {vm.pages.map((page, index) => (
            <a
              key={page.id}
              href={`#${page.id}`}
              aria-current={index === vm.index ? 'page' : undefined}
              onClick={() => setContentsOpen(false)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{page.label}</strong>
              <Icon name="arrow" size={18} />
            </a>
          ))}
        </nav>
        <p className="action-caption">
          Use Anterior e Próxima ou deslize para os lados. Textos maiores podem ser rolados dentro
          da folha.
        </p>
      </BookDialog>
    </main>
  );
}
