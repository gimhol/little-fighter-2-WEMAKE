import { ForwardedRef, useRef } from "react";

export function useForwardedRef<T>(forwarded_ref: ForwardedRef<T>) {
  const ref = useRef<T | null>(null);
  return [
    ref,
    (v: T | null) => {
      ref.current = v;
      if (typeof forwarded_ref === 'function')
        forwarded_ref(v);
      else if (forwarded_ref)
        forwarded_ref.current = v;
    }
  ] as const;
}
