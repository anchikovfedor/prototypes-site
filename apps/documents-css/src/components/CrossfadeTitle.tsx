import { useEffect, useRef } from 'react';

// Заголовок panel header: text-swap по transitions.dev (3 фазы):
// 1) is-exit — старый текст уезжает вверх + blur + fade;
// 2) меняем текст, мгновенно ставим is-enter-start (ниже, без перехода);
// 3) reflow → снимаем is-enter-start → новый текст возвращается на место.
// Параметры (dur 150ms / translateY 4px / blur 2px / ease-in-out) — в CSS (.title-swap).
const SWAP_DUR = 150;

interface Props {
  open: boolean;
  docTitle: string;
  /** false → текст меняется мгновенно (тумблер Motion off / reduced-motion). */
  animate: boolean;
}

export function CrossfadeTitle({ open, docTitle, animate }: Props) {
  const target = open ? docTitle : 'Документы из Облака';
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef<string | null>(null);

  // Текст и классы пишем императивно (React не рендерит детей span — не сбрасывает классы).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prev.current === null) {
      el.textContent = target; // первый рендер — без анимации
      prev.current = target;
      return;
    }
    if (target === prev.current) return;
    prev.current = target;
    if (!animate) {
      el.textContent = target;
      return;
    }
    el.classList.add('is-exit');
    const t = setTimeout(() => {
      el.textContent = target;
      el.classList.add('is-enter-start');
      el.classList.remove('is-exit');
      void el.offsetWidth; // форсим reflow, чтобы enter-start применился без перехода
      el.classList.remove('is-enter-start');
    }, SWAP_DUR);
    return () => clearTimeout(t);
  }, [target, animate]);

  return <span ref={ref} className="title-swap" />;
}
