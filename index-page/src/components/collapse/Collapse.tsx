import { useEffect, useRef, useState } from "react";
import csses from "./Collapse.module.scss";
import classnames from "classnames";

export interface ICollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  classNames?: { inner?: string }
  styles?: { inner?: React.CSSProperties }
}
export function Collapse(props: ICollapseProps) {
  const { open = true, className, children, style, classNames, styles, ..._p } = props;
  const ref_measurer = useRef<HTMLDivElement>(null);
  const [height, set_height] = useState<number>()
  useEffect(() => {
    const el_measurer = ref_measurer.current;
    if (!el_measurer) return;
    const on_resize = () => {
      set_height(el_measurer.clientHeight);
    }
    const ob = new ResizeObserver(on_resize);
    ob.observe(el_measurer);
    on_resize();
    return () => ob.disconnect();
  }, [])

  return (
    <div
      className={classnames(csses.collapse_root, className)}
      style={{ ...style, height: open ? height : 0 }}
      {..._p}>
      <div
        className={classnames(csses.collapse_inner, classNames?.inner)}
        ref={ref_measurer}
        style={styles?.inner}>
        {children}
      </div>
    </div>
  )
}