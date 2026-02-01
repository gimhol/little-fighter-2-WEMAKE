import { useEffect } from 'react';

export function useMovingBg(el: HTMLElement | null | undefined) {
  useEffect(() => {
    console.log('useMovingBg')
    if (!el) return;
    let x = 0;
    let y = 0;
    const a = Math.random() * Math.PI;
    const xd = Math.sin(a)
    const yd = Math.cos(a)
    const tid = setInterval(() => {
      x = (x + xd) % 32;
      y = (y + yd) % 32;
      el.style.backgroundPosition = `${x}px ${y}px`;
    }, 30);
    return () => clearInterval(tid);
  }, [el]);
}
