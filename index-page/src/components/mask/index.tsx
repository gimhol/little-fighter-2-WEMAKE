import classnames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import csses from "./styles.module.scss";

export interface IMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?(): void;
  closeOnMask?: boolean;
  container?: Element | (() => Element);
}
let _mask_count = 0;
export function Mask(props: IMaskProps) {
  const {
    style, open, onClose, className, closeOnMask = false,
    onClick, onKeyDown, container, ..._p
  } = props;
  const ref_el = useRef<HTMLDivElement>(null)
  const cls_root = classnames(csses.mask, className)
  const sty_root: React.CSSProperties = useMemo(() => ({
    ...style,
    opacity: open ? 1 : void 0,
    pointerEvents: open ? 'all' : void 0,
  }), [style, open])

  const [gone, set_gone] = useState(!open);
  useEffect(() => {
    if (open) {
      set_gone(false)
      _mask_count++;
      ref_el.current?.focus();
    }
    document.getElementById('root')!.style.filter = _mask_count ? `blur(${_mask_count * 5}px)` : ''
    if (open) return () => { _mask_count-- };
    const tid = setTimeout(() => set_gone(true), 1000);
    return () => clearTimeout(tid)
  }, [open])

  const inner = (
    <div {..._p}
      ref={ref_el}
      tabIndex={-1}
      style={sty_root}
      className={cls_root}
      onKeyDown={e => {
        if (onKeyDown) return onKeyDown?.(e);
        if (e.key.toLowerCase() === 'escape') {
          e.stopPropagation();
          e.preventDefault();
          onClose?.();
        }
      }}
      onClick={e => {
        if (onClick) return onClick?.(e);
        if (!closeOnMask) return;
        if (e.target !== ref_el.current) return;
        e.stopPropagation();
        e.preventDefault();
        onClose?.();
      }}
    />
  )
  if (gone) return;
  if (container)
    return createPortal(inner, typeof container === 'function' ? container() : container)
  return inner
}