import React, { useRef } from "react";
import { Input, type InputProps, type InputRef } from "./_Input";

export interface InputNumberProps extends Omit<InputProps, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  value?: number;
  defaultValue?: number;
  onChange?(v: number | undefined): void;
}

function keep_precision(num: number, precision: number) {
  if (!Number.isInteger(precision)) return num;
  if (precision < 0) return num
  if (precision == 0) return Math.round(num)

  const base = 10 ** precision;
  return Math.round(num * base) / base;
}
function _InputNumber(props: InputNumberProps, forwarded_Ref: React.ForwardedRef<InputRef>) {
  const { onBlur, onChange, value, precision = -1, ..._p } = props;
  const ref_num = useRef<number | undefined>(value);

  const _on_change = (value: string) => {
    const str = value.trim();
    if (!str) {
      onChange?.(ref_num.current = void 0);
      return
    }
    const num = Number(str)
    if (!isNaN(num)) onChange?.(ref_num.current = keep_precision(num, precision));
  }
  const _on_blur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    const str = e.target.value.trim();
    if (!str) {
      onChange?.(ref_num.current = void 0);
      return
    }
    const num = Number(str)
    if (ref_num.current == num) onChange?.(ref_num.current = keep_precision(num, precision));
    else onChange?.(ref_num.current);
  }
  return (
    <Input
      {..._p}
      precision={precision}
      value={value}
      type='number'
      ref={forwarded_Ref}
      onChange={_on_change}
      onBlur={_on_blur} />
  )
}
export const InputNumber: React.FC<InputNumberProps & React.RefAttributes<InputRef>> = React.forwardRef<InputRef, InputNumberProps>(_InputNumber);
