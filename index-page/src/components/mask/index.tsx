import { useEffect, useMemo, useRef } from "react";
import csses from "./styles.module.scss";
import classnames from "classnames";

export interface IMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?(): void;
  closeOnMask?: boolean;
}
export function Mask(props: IMaskProps) {
  const { style, open, onClose, className, closeOnMask = false, onClick, onKeyDown, ..._p } = props;
  const ref_el = useRef<HTMLDivElement>(null)
  const cls_root = classnames(csses.mask, className)
  const sty_root: React.CSSProperties = useMemo(() => ({
    ...style,
    opacity: open ? 1 : void 0,
    pointerEvents: open ? 'all' : void 0,
  }), [style, open])

  useEffect(() => {
    if (open) ref_el.current?.focus();
  }, [open])

  return (
    <div {..._p}
      ref={ref_el}
      tabIndex={-1}
      style={sty_root}
      className={cls_root}
      onKeyDown={e => {
        if (onKeyDown) return onKeyDown?.(e);
        if (e.key.toLowerCase() === 'escape') onClose?.();
      }}
      onClick={e => {
        if (onClick) return onClick?.(e);
        if (!closeOnMask) return;
        if (e.target !== ref_el.current) return;
        e.stopPropagation()
        onClose?.();
      }}
    />
  )
}