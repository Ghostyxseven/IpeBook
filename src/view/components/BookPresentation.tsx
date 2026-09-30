import { Children, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useBookNavigation } from '../../viewmodel/useBookNavigation';
import { BookDialog } from './BookDialog';
import { Icon } from './Icon';

/** Faixas contíguas dão curvatura à folha; o conteúdo real permanece sem duplicação acessível. */
export function BookPresentation({ hash, children }: { hash: string; children: ReactNode }) {
  const vm = useBookNavigation(hash);
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const previous = useRef(vm.index);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const keyboard = useRef(false);
  const pages = Children.toArray(children);
  const [contentsOpen, setContentsOpen] = useState(false);

  useLayoutEffect(() => {
    const root = stage.current!;
    const layer = overlay.current!;
    const old = previous.current;
    previous.current = vm.index;
    if (old === vm.index) return;
    const target = root.children[vm.index] as HTMLElement;
    if (root.contains(document.activeElement)) target.focus({ preventScroll: true });
    if (vm.reducedMotion || keyboard.current) {
      keyboard.current = false;
      return;
    }
    const backwards = vm.index < old;
    const source = root.children[backwards ? vm.index : old] as HTMLElement;
    const width = root.clientWidth;
    const height = root.clientHeight;
    const count = 60;
    const stripWidth = width / count;
    const duration =
      parseFloat(getComputedStyle(root).getPropertyValue('--landing-book-duration')) || 1800;
    const animations: Animation[] = [];
    const frames: Keyframe[][] = Array.from({ length: count }, () => []);
    const shading: Keyframe[][] = Array.from({ length: count }, () => []);
    const faces: Keyframe[][] = Array.from({ length: count }, () => []);
    for (let step = 0; step <= 60; step++) {
      const progress = step / 60;
      let x = 0;
      let z = 0;
      for (let strip = 0; strip < count; strip++) {
        const angle = Math.max(
          0,
          Math.min(Math.PI, ((strip / count - (1 - progress * 1.4)) / 0.35) * Math.PI),
        );
        frames[strip].push({
          transform: `translate3d(${x}px, ${Math.sin(angle) * -15}px, ${z}px) rotateY(${-angle}rad) rotateX(${Math.sin(angle) * 0.05}rad)`,
        });
        shading[strip].push({ opacity: Math.sin(angle) * 0.22 });
        faces[strip].push({ opacity: angle > Math.PI / 2 ? 0 : 1 });
        x += Math.cos(angle) * stripWidth;
        z += Math.sin(angle) * stripWidth;
      }
    }
    for (let strip = 0; strip < count; strip++) {
      const paper = document.createElement('div');
      paper.className = 'book-strip';
      paper.style.width = `${stripWidth + 1}px`;
      paper.style.height = `${height}px`;
      const snapshot = source.cloneNode(true) as HTMLElement;
      snapshot.removeAttribute('inert');
      snapshot.removeAttribute('aria-hidden');
      snapshot.className = 'book-page book-snapshot';
      snapshot.style.width = `${width}px`;
      snapshot.style.height = `${height}px`;
      snapshot.style.left = `${-strip * stripWidth}px`;
      snapshot.removeAttribute('id');
      snapshot.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      paper.appendChild(snapshot);
      const shade = document.createElement('div');
      shade.className = 'book-strip-shade';
      shade.style.background = 'var(--color-text)';
      paper.appendChild(shade);
      layer.appendChild(paper);
      snapshot.scrollTop = source.scrollTop;
      const options: KeyframeAnimationOptions = {
        duration,
        easing: getComputedStyle(root).getPropertyValue('--landing-book-easing').trim(),
        fill: 'both',
        direction: backwards ? 'reverse' : 'normal',
      };
      animations.push(paper.animate(frames[strip], options));
      animations.push(shade.animate(shading[strip], options));
      animations.push(snapshot.animate(faces[strip], options));
    }
    // Ao voltar, a folha anterior se abre sobre a página atual.
    if (backwards) (root.children[old] as HTMLElement).classList.add('book-underlay');
    const clear = () => {
      animations.forEach((animation) => animation.cancel());
      layer.replaceChildren();
      root
        .querySelectorAll('.book-underlay')
        .forEach((node) => node.classList.remove('book-underlay'));
    };
    animations[0].finished.then(clear).catch(() => {});
    window.addEventListener('resize', clear);
    return () => {
      window.removeEventListener('resize', clear);
      clear();
    };
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
          keyboard.current = true;
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
        <div
          className="book-stage"
          ref={stage}
          onTouchStart={(event) => {
            if (
              (event.target as HTMLElement).closest(
                'a, button, summary, input, select, dialog, .mockup-carousel',
              )
            )
              return;
            touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
          }}
          onTouchCancel={() => {
            touch.current = null;
          }}
          onTouchEnd={(event) => {
            if (!touch.current) return;
            const dx = event.changedTouches[0].clientX - touch.current.x;
            const dy = event.changedTouches[0].clientY - touch.current.y;
            touch.current = null;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
              vm.goTo(vm.index + (dx < 0 ? 1 : -1));
          }}
        >
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
        <div className="book-swipe-indicator" aria-hidden="true">
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
