import classNames from "classnames";
import React, { type ReactNode, useState } from "react";
import { Button, type IButtonProps } from "./Buttons/Button";
import styles from "./Checkbox.module.scss";
import { Tick } from "./Icons/Tick";
export interface ICheckboxProps extends Omit<IButtonProps, "value" | "prefix" | "onChange"> {
  prefix?: ReactNode;
  value?: boolean;
  onChange?(v: boolean): void;
}
export const Checkbox = React.forwardRef<HTMLButtonElement, ICheckboxProps>(
  (props: ICheckboxProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const { value, onClick, onChange: onChanged, className, prefix, children, ..._p } = props;
    const [_value, _set_value] = useState<boolean | undefined>(value);
    const _on_click = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      _set_value((v) => !v);
      onChanged?.(!value);
    };
    const checked = value ?? _value;
    const root_className = classNames(styles.lf2ui_checkbox, className)
    const inner_className = classNames({
      [styles.inner_show]: checked,
      [styles.inner_hide]: !checked,
    })
    return (
      <Button
        {..._p}
        variants='no_border'
        className={root_className}
        onClick={_on_click} _ref={ref}>
        {prefix}
        <span className={styles.qube} data-checked={'' + checked}>
          <Tick className={inner_className} />
        </span>
        {children}
      </Button>
    );
  },
);
