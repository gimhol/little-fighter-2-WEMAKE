import classNames from "classnames";
import { useMemo } from "react";
import styles from "../../styles/lfui_border.module.scss";
import type { TVariant } from "./Variant";

export function useStyleBase(variants?: TVariant[] | string, ...classnames: (string | undefined)[]) {
  return {
    className: useMemo(() => classNames({
      [styles.lfui_no_border]: variants?.includes('no_border'),
      [styles.lfui_no_round]: variants?.includes('no_round'),
      [styles.lfui_no_shadow]: variants?.includes('no_shadow'),
    }, ...classnames), [variants, ...classnames])
  }
}