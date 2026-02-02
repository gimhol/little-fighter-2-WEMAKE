
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import styles from "./CardBase.module.scss";

function lerp(from: number, to: number, factor: number) {
  return from + (to - from) * factor;
}
export interface ICardBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  __keep?: never
}
export function CardBase(props: ICardBaseProps) {
  const { className, children, ..._p } = props;
  const ref_div = useRef<HTMLDivElement>(null)
  const [el_card, set_el_card] = useState<HTMLDivElement | null>(null)
  const [card_style, set_card_style] = useState<React.CSSProperties>({})
  const [is_pointer_down, set_is_pointer_down] = useState(false);
  useEffect(() => set_el_card(ref_div.current), [])
  const on_pointer_move = (e: React.PointerEvent) => {
    const el = el_card;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = lerp(15, -15, x)
    const ry = lerp(8, -8, y)
    const transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
    const filter = `contrast(${lerp(1.1, 0.9, x)})`;
    set_card_style({ filter, transform })
  }
  const on_pointer_leave = () => {
    set_card_style({
      filter: 'contrast(1)',
      transform: 'rotateX(0deg) rotateY(0deg)'
    })
  }
  const on_pointer_down = (e: React.PointerEvent) => {
    if (e.button != 0) return;
    set_is_pointer_down(true);
    set_card_style({
      filter: 'contrast(1)',
      transform: 'rotateX(0deg) rotateY(0deg)'
    })
  }
  const on_pointer_up = (e: React.PointerEvent) => {
    if (e.button != 0) return;
    set_is_pointer_down(false)
    on_pointer_move(e)
  }
  return (
    <div className={classnames(styles.card_root, className)} {..._p}>
      <div
        ref={ref_div}
        className={classnames(styles.card)}
        onPointerMove={is_pointer_down ? void 0 : on_pointer_move}
        onPointerLeave={on_pointer_leave}
        onPointerDown={on_pointer_down}
        onPointerUp={on_pointer_up}
        onPointerCancel={on_pointer_up}
        style={card_style} >
        {children}
      </div>
    </div >
  )
}