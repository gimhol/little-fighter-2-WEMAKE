import classNames from "classnames";
import { type ForwardedRef, forwardRef } from "react";
import styles from "./styles.module.scss";
export type UiSize = 'ss' | 's' | 'm' | 'l'
export interface ITextProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: UiSize;
}
function _Text(props: ITextProps, ref: ForwardedRef<HTMLSpanElement>) {
  const { className, size = 'm', ..._p } = props;
  return <span className={classNames(styles.lfui_txt, styles[size], className)} {..._p} ref={ref} />
}
function _Strong(props: ITextProps, ref: ForwardedRef<HTMLElement>) {
  const { className, size = 'm', ..._p } = props;
  return <strong className={classNames(styles.lfui_txt, styles[size], className)} {..._p} ref={ref} />
}
export const Strong = forwardRef<HTMLElement, ITextProps>(_Strong);

export const Text = Object.assign(
  forwardRef<HTMLSpanElement, ITextProps>(_Text),
  { Strong }
);
export namespace Text {
  export type UiSize = 'ss' | 's' | 'm' | 'l';
}