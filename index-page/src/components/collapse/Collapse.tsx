import { useEffect, useRef, useState } from "react";
import csses from "./Collapse.module.scss";

export interface ICollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
}
export function Collapse(props: ICollapseProps) {
  const { open = true, children, ..._p } = props;
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
    <div className={csses.collapse_root} style={{ height: open ? height : 0 }} {..._p}>
      <div className={csses.collapse_inner} ref={ref_measurer}>
        {children}
      </div>
    </div>
  )
}