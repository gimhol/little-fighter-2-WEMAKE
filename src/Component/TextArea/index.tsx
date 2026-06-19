import React, { useEffect, useMemo, useRef } from "react";
import { useStyleBase } from "../StyleBase/useStyleBase";
import type { TVariant } from "../StyleBase/Variant";
import styles from "./styles.module.scss";

export interface ITextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?(value: string | undefined): void;
  variants?: TVariant | TVariant[];
}
export interface ITextAreaRef {
  readonly textarea: HTMLTextAreaElement | null;
  value: string | undefined;
}

function _TextArea(props: ITextAreaProps, forwarded_Ref: React.ForwardedRef<ITextAreaRef>) {
  const { onChange, className, variants, ..._p } = props
  const { className: classname } = useStyleBase(variants, styles.lfui_textarea, className)
  const ref_textarea = useRef<HTMLTextAreaElement>(null);
  useMemo<ITextAreaRef>(() => {
    const ret: ITextAreaRef = {
      get textarea() { return ref_textarea.current },
      get value() { return ref_textarea.current?.value },
      set value(v) { if (ref_textarea.current) ref_textarea.current.value = v ?? '' }
    };
    if (typeof forwarded_Ref === 'function') {
      forwarded_Ref(ret)
    } else if (forwarded_Ref) {
      forwarded_Ref.current = ret;
    }
    return ret;
  }, [forwarded_Ref])

  const { defaultValue } = props;
  const has_value = 'value' in props
  useEffect(() => {
    if (has_value) return;
    if (!ref_textarea.current) return;
    if (typeof defaultValue !== 'string') return;
    ref_textarea.current.value = defaultValue;
  }, [defaultValue, has_value])

  return <textarea {..._p} className={classname} onChange={e => onChange?.(e.target.value)} ref={ref_textarea} />;
}
export const TextArea = React.forwardRef<ITextAreaRef, ITextAreaProps>(_TextArea);
