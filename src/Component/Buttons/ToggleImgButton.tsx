import device from "current-device";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ToggleImgButton.module.scss";
import classNames from "classnames";
import { TShortcut, useForwardedRef, useShortcut } from "@fimagine/dom-hooks";
const is_desktop = device.desktop();

export interface IToggleImgProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onToggle"> {
  checked?: boolean;
  alt?: [string, string] | string;
  onToggle?(v: boolean): void;
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
  show_shortcut?: boolean;
  src?: [string, string] | [string];
  ref?: React.Ref<HTMLButtonElement>;
}
export const ToggleImgButton: React.FC<IToggleImgProps> = React.forwardRef<
  HTMLButtonElement,
  IToggleImgProps
>((props: IToggleImgProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
  const {
    src: children = [],
    checked = false,
    onClick,
    onToggle,
    shortcut,
    shortcutTarget = window,
    show_shortcut,
    className,
    alt,
    ...remain_props
  } = props;
  const [ref_btn, on_ref] = useForwardedRef<HTMLButtonElement>(ref);

  const ref_checked = useRef(checked);
  ref_checked.current = checked;

  const ref_onToggle = useRef(onToggle);
  ref_onToggle.current = onToggle;

  const unchecked_src = children[1] ?? children[0];
  const checked_src = children[0];

  const alt_0 = Array.isArray(alt) ? alt[0] : alt;
  const alt_1 = Array.isArray(alt) ? alt[1] : alt;

  const _onClick: typeof onClick = (e) => {
    onClick?.(e);
    onToggle?.(!checked);
  };
  useShortcut(shortcut, props.disabled, ref_btn, shortcutTarget);

  const [has_keyboard, set_has_keyboard] = useState(is_desktop);

  useEffect(() => {
    const o = () => set_has_keyboard(true);
    window.addEventListener("keydown", o, { once: true });
    return () => window.removeEventListener("keydown", o);
  }, []);

  const _show_shortcut = show_shortcut ?? has_keyboard;
  const root_className = classNames(styles.lf2ui_img_button, className)
  return (
    <button
      {...remain_props}
      className={root_className}
      type={props.type ?? "button"}
      ref={on_ref}
      onClick={_onClick}
      title={_show_shortcut ? shortcut : ""}
    >
      <div className={styles.inner_div}>
        <img
          draggable={false}
          className={classNames(styles.inner_0, styles["" + checked])}
          src={unchecked_src}
          alt={alt_0}
        />
        <img
          draggable={false}
          className={classNames(styles.inner_1, styles["" + checked])}
          src={checked_src}
          alt={alt_1}
        />
      </div>
    </button>
  );
});
