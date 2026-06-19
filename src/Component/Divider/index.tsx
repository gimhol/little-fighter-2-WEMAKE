import classNames from "classnames";
import type { HTMLAttributes } from "react";
import styles from "./styles.module.scss";
export interface IDividerProps extends HTMLAttributes<HTMLDivElement> {

}
export function Divider(props: IDividerProps) {
  const { className, ..._p } = props;
  const _className = classNames(styles.lfui_divider, className)
  return <div {..._p} className={_className} />
}