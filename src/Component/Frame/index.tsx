import { type ForwardedRef, forwardRef } from "react";
import styles from "./style.module.scss";
import classnames from "classnames";
import type { IStyleProps } from "../StyleBase/IStyleProps";
import { useStyleBase } from "../StyleBase/useStyleBase";
export interface IFrameProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>, IStyleProps {
  label?: React.ReactNode;
  active?: boolean;
  hoverable?: boolean;
}
export default forwardRef<HTMLDivElement, IFrameProps>(
  function Frame(props: IFrameProps, rorwarded_ref: ForwardedRef<HTMLDivElement>) {
    const { className, label, active, hoverable = true, variants, ..._p } = props;

    const { className: variant_cls_name } = useStyleBase(variants);
    const cls_name = classnames(styles.lfui_frame, {
      [styles.with_label]: label,
      [styles.active]: active,
      [styles.hoverable]: hoverable,
    }, className, variant_cls_name)
    return (
      <div {..._p} className={cls_name} ref={rorwarded_ref}>
        {label ? <span className={styles.label}>{label}</span> : null}
        {props.children}
      </div>
    );
  }
)
