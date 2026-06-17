import classnames from "classnames";
import React, { Children, ForwardedRef, forwardRef, isValidElement, CSSProperties } from "react";
import styles from "./style.module.scss";

export interface ICombineProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  hoverable?: boolean;
}

function wrap_item(child: React.ReactNode, index: number): React.ReactNode {
  if (child == null || child === false) return null;
  const flex = isValidElement(child) ? (child.props as any)['data-flex'] : void 0;
  const style: CSSProperties = flex != null ? { flex } : {};
  return (
    <div key={index} className={styles.item} style={style}>
      {child}
    </div>
  );
}

function _Combine(props: ICombineProps, f_ref: ForwardedRef<HTMLDivElement>) {
  const {
    className,
    direction = 'row',
    hoverable = true,
    children,
    style,
    ...rest
  } = props;

  const cls = classnames(
    styles.lfui_combine,
    styles[direction],
    { [styles.hoverable]: hoverable },
    className,
  );

  return (
    <div className={cls} style={style} {...rest} ref={f_ref}>
      {Children.map(children, wrap_item)}
    </div>
  );
}

export const Combine = forwardRef<HTMLDivElement, ICombineProps>(_Combine);
export default Combine;

