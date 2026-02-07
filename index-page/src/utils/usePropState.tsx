import { useState } from "react";

export function usePropState<T>(value?: T, whenChange?: (v: T) => void) {
  const [_inner, _set_inner] = useState(value);
  const __value = whenChange ? value : _inner;
  const __set_value = whenChange ?? _set_inner;
  return [__value, __set_value] as const;
}
