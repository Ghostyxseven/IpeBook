/** Estado exclusivamente visual: navegação e conteúdo continuam na ViewModel. */
export function createBookTurn(
  stage: HTMLElement,
  layer: HTMLElement,
  options: {
    index: () => number;
    reduced: () => boolean;
    navigate: (index: number) => void;
    onGesture: () => void;
  },
) {
  const count = 12;
  let turn: {
    from: number;
    to: number;
    progress: number;
    width: number;
    strips: { paper: HTMLElement; face: HTMLElement; shade: HTMLElement }[];
  } | null = null;
  let pointer: {
    id: number;
    x: number;
    y: number;
    lastX: number;
    time: number;
    velocity: number;
    start: number;
    dragging: boolean;
  } | null = null;
  let clock: Animation | null = null;
  let frame = 0;
  let committed: number | null = null;
  let suppressClick = false;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));

  function stop() {
    cancelAnimationFrame(frame);
    clock?.cancel();
    clock = null;
  }
  function clear() {
    stop();
    const captured = pointer?.id;
    pointer = null;
    if (captured !== undefined && stage.hasPointerCapture(captured)) {
      stage.releasePointerCapture(captured);
    }
    turn = null;
    layer.replaceChildren();
    stage.classList.remove('is-dragging');
    stage.querySelectorAll('.book-turn-preview, .book-turn-hidden').forEach((page) => {
      page.classList.remove('book-turn-preview', 'book-turn-hidden');
    });
  }
  function paint(progress: number) {
    if (!turn) return;
    turn.progress = clamp(progress);
    const forward = turn.to > turn.from;
    const curl = forward ? turn.progress : 1 - turn.progress;
    let x = 0;
    let z = 0;
    const width = turn.width / count;
    turn.strips.forEach(({ paper, face, shade }, strip) => {
      const angle = Math.PI * clamp((strip / count - (1 - curl * 1.4)) / 0.35);
      paper.style.transform = `translate3d(${x}px, ${-Math.sin(angle) * 15}px, ${z}px) rotateY(${-angle}rad)`;
      shade.style.opacity = String(Math.sin(angle) * 0.22);
      face.style.opacity = angle > Math.PI / 2 ? '0' : '1';
      x += Math.cos(angle) * width;
      z += Math.sin(angle) * width;
    });
  }
  function prepare(from: number, to: number) {
    clear();
    if (to < 0 || to >= stage.children.length || from === to) return false;
    const forward = to > from;
    const source = stage.children[forward ? from : to] as HTMLElement;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return false;
    const strips = [];
    const fragment = document.createDocumentFragment();
    for (let strip = 0; strip < count; strip++) {
      const paper = document.createElement('div');
      paper.className = 'book-strip';
      paper.style.width = `${width / count + 1}px`;
      paper.style.height = `${height}px`;
      const face = source.cloneNode(true) as HTMLElement;
      face.className = 'book-page book-snapshot';
      face.removeAttribute('inert');
      face.removeAttribute('aria-hidden');
      face.removeAttribute('id');
      face.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      face.style.width = `${width}px`;
      face.style.height = `${height}px`;
      face.style.left = `${(-strip * width) / count}px`;
      const shade = document.createElement('div');
      shade.className = 'book-strip-shade';
      paper.append(face, shade);
      fragment.append(paper);
      strips.push({ paper, face, shade });
    }
    layer.append(fragment);
    const originalNodes = [source, ...source.querySelectorAll<HTMLElement>('*')];
    strips.forEach(({ face }) => {
      [face, ...face.querySelectorAll<HTMLElement>('*')].forEach((node, index) => {
        if (originalNodes[index].scrollTop) node.scrollTop = originalNodes[index].scrollTop;
        if (originalNodes[index].scrollLeft) node.scrollLeft = originalNodes[index].scrollLeft;
      });
    });
    const underneath = stage.children[forward ? to : from];
    underneath.classList.add('book-turn-preview');
    if (forward) source.classList.add('book-turn-hidden');
    turn = { from, to, width, strips, progress: 0 };
    paint(0);
    return true;
  }
  function settle(complete: boolean, navigate = true) {
    if (!turn) return;
    stop();
    const current = turn;
    const start = current.progress;
    const end = complete ? 1 : 0;
    const finish = () => {
      paint(end);
      if (complete && navigate && options.index() !== current.to) {
        committed = current.to;
        options.navigate(current.to);
        // A camada permanece até o React confirmar o capítulo.
      } else clear();
    };
    if (options.reduced() || Math.abs(end - start) < 0.001) {
      finish();
      return;
    }
    const styles = getComputedStyle(stage);
    clock = layer.animate([{ opacity: 1 }, { opacity: 1 }], {
      duration: parseFloat(styles.getPropertyValue('--landing-book-duration')) || 250,
      easing:
        styles.getPropertyValue('--landing-book-easing').trim() || 'cubic-bezier(0.23, 1, 0.32, 1)',
      fill: 'both',
    });
    const animation = clock;
    const tick = () => {
      if (clock !== animation) return;
      const progress = animation.effect?.getComputedTiming().progress ?? 0;
      paint(start + (end - start) * progress);
      if (animation.playState === 'finished') {
        stop();
        finish();
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }
  function down(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0 || pointer) return;
    suppressClick = false;
    if (
      (event.target as Element).closest(
        'a, button, input, textarea, select, dialog, [role="dialog"], [contenteditable], .mockup-carousel',
      )
    )
      return;
    stop();
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      time: event.timeStamp,
      velocity: 0,
      start: turn?.progress ?? 0,
      dragging: !!turn,
    };
    if (turn) stage.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const gesture = pointer;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.5) {
        pointer = null;
        return;
      }
      const from = options.index();
      const to = from + (dx < 0 ? 1 : -1);
      if (to < 0 || to >= stage.children.length) {
        pointer = null;
        return;
      }
      if (!options.reduced() && !prepare(from, to)) return;
      pointer = gesture;
      gesture.dragging = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
      options.onGesture();
    }
    const elapsed = event.timeStamp - gesture.time;
    if (elapsed > 0) gesture.velocity = (event.clientX - gesture.lastX) / elapsed;
    gesture.lastX = event.clientX;
    gesture.time = event.timeStamp;
    if (turn) paint(gesture.start + (dx * (turn.to > turn.from ? -1 : 1)) / turn.width);
    event.preventDefault();
  }
  function up(event: PointerEvent, cancelled = false) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const gesture = pointer;
    pointer = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (!gesture.dragging) return;
    suppressClick = true;
    const dx = event.clientX - gesture.x;
    const direction = turn ? Math.sign(turn.to - turn.from) : dx < 0 ? 1 : -1;
    const velocity = event.timeStamp - gesture.time < 100 ? -gesture.velocity * direction : 0;
    const progress = turn?.progress ?? Math.abs(dx) / stage.clientWidth;
    const complete =
      !cancelled && velocity > -0.3 && (progress >= 0.35 || (progress > 0.05 && velocity > 0.5));
    if (turn) settle(complete);
    else if (complete) options.navigate(options.index() + direction);
  }
  function sync(from: number, to: number, instant: boolean) {
    if (committed === to) {
      committed = null;
      clear();
      return;
    }
    committed = null;
    clear();
    if (from !== to && !instant && !options.reduced() && prepare(from, to)) settle(true, false);
  }
  const cancel = (event: PointerEvent) => up(event, true);
  // A captura implícita do filho é transferida ao palco; isso não cancela o gesto.
  const lostCapture = (event: PointerEvent) => {
    if (event.target === stage) cancel(event);
  };
  const click = (event: MouseEvent) => {
    if (suppressClick && event.detail !== 0) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }
  };
  stage.addEventListener('pointerdown', down);
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', cancel);
  stage.addEventListener('lostpointercapture', lostCapture);
  stage.addEventListener('click', click, true);
  window.addEventListener('resize', clear);
  return {
    sync,
    destroy() {
      clear();
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', cancel);
      stage.removeEventListener('lostpointercapture', lostCapture);
      stage.removeEventListener('click', click, true);
      window.removeEventListener('resize', clear);
    },
  };
}
