
import classnames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import csses from "./CardBase.module.scss";

function lerp(from: number, to: number, factor: number) {
  return from + (to - from) * factor;
}
export interface ICardBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  __keep?: never
  __ref?: React.Ref<HTMLDivElement>;
  floating?: boolean;
  styles?: {
    root?: React.CSSProperties,
    card?: React.CSSProperties,
  },
  classNames?: {
    root?: string,
    card?: string,
  }
}
export function CardBase(props: ICardBaseProps) {
  const {
    className, children, __ref, floating = true, styles, style, classNames,
    ..._p
  } = props;
  const ref_div = useRef<HTMLDivElement>(null)
  const [el_card, set_el_card] = useState<HTMLDivElement | null>(null)
  const [dynamic_card_style, set_dynamic_card_style] = useState<React.CSSProperties>({})
  const [is_pointer_down, set_is_pointer_down] = useState(false);

  const on_pointer_move = (e: React.PointerEvent) => {
    if (is_pointer_down) return;
    const el = el_card;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = lerp(15, -15, x)
    const ry = lerp(8, -8, y)
    const transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
    const filter = `contrast(${lerp(1.1, 0.9, x)})`;
    set_dynamic_card_style(prev => (
      filter === prev.filter &&
      transform === prev.transform
    ) ? prev : { filter, transform })
  }
  const on_pointer_leave = () => {
    const filter = 'contrast(1)'
    const transform = 'rotateX(0deg) rotateY(0deg)'
    set_dynamic_card_style(prev => (
      filter === prev.filter &&
      transform === prev.transform
    ) ? prev : { filter, transform })
  }
  const on_pointer_down = (e: React.PointerEvent) => {
    if (e.button != 0) return;
    set_is_pointer_down(true);
    const filter = 'contrast(1)'
    const transform = 'rotateX(0deg) rotateY(0deg)'
    set_dynamic_card_style(prev => (
      filter === prev.filter &&
      transform === prev.transform
    ) ? prev : { filter, transform })
  }
  const on_pointer_up = (e: React.PointerEvent) => {
    set_is_pointer_down(false)
    on_pointer_move(e)
  }
  useEffect(() => set_el_card(ref_div.current), [])
  const cls_root = classnames(
    csses.card_root,
    { [csses.floating]: floating },
    classNames?.root,
    className
  )
  const cls_card = classnames(csses.card, classNames?.card)
  const styles_root = styles?.root
  const styles_card = styles?.card
  const sty_root = useMemo(() => {
    return { ...styles_root, ...style }
  }, [styles_root, style])

  const sty_card = useMemo(() => {
    return { ...dynamic_card_style, ...styles_card }
  }, [styles_card, dynamic_card_style])

  return (
    <div className={cls_root} ref={__ref} style={sty_root} {..._p}>
      <div
        ref={ref_div}
        className={cls_card}
        onPointerMove={(floating && !is_pointer_down) ? on_pointer_move : void 0}
        onPointerLeave={floating ? on_pointer_leave : void 0}
        onPointerDown={floating ? on_pointer_down : void 0}
        onPointerUp={floating ? on_pointer_up : void 0}
        onPointerCancel={floating ? on_pointer_up : void 0}
        style={sty_card} >
        {children}
      </div>
    </div >
  )
}