import { useEffect } from 'react';

export function useMovingBg(el: HTMLElement | null | undefined) {
  useEffect(() => {
    if (!el) return;
    let x = 0;
    let y = 0;
    let a = Math.random() * Math.PI;
    const d = Math.random() > 0.5 ? -1 : 1;
    const tid = setInterval(() => {
      a += 0.01 * d;
      const xd = Math.sin(a)
      const yd = Math.cos(a)
      x = (x + xd) % 32;
      y = (y + yd) % 32;
      el.style.backgroundPosition = `${x}px ${y}px`;
    }, 100);
    return () => clearInterval(tid);
  }, [el]);
}
