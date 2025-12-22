import classnames from "classnames";
import React, { ForwardedRef, forwardRef, isValidElement, useMemo, useRef } from "react";
import styles from "./style.module.scss";
import Show from "../Show";
import { useForwardedRef } from "@fimagine/dom-hooks";
export interface ICombineProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column',
  hoverable?: boolean
}
function _Combine(props: ICombineProps, f_ref: ForwardedRef<HTMLDivElement>) {
  const { className, direction = 'row',
    hoverable = true, children, ..._p } = props;
  const cls_name = classnames(
    styles.lfui_combine,
    styles[direction],
    { [styles.hoverable]: hoverable },
    className
  )
  const [ref, on_ref] = useForwardedRef(f_ref)
  const _children = useMemo(() => {
    if (!children || !Array.isArray(children)) return children;
    return children.map((child, index) => {
      if (!child) return null;
      if (!isValidElement<any>(child)) {
        return <div key={index} className={styles.item}>{child}</div>
      }
      if (child.type === Show && !child.props.show)
        return null;
      const style: React.CSSProperties = {
        flex: child.props['data-flex'] ?? void 0
      }
      return <div key={index} className={styles.item} style={style}>{child}</div>
    })
  }, [children])
  return (
    <div className={cls_name} {..._p} ref={on_ref}>
      {_children}
    </div>
  );
}
export const Combine = forwardRef<HTMLDivElement, ICombineProps>(_Combine)
export default Combine

