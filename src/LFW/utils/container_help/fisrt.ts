export function fisrt<T>(iterable: Iterable<T>): T | undefined;
export function fisrt<T, R>(
  iterable: Iterable<T>,
  p: (v: T) => R,
): R | undefined;
export function fisrt<T, R>(
  iterable: Iterable<T>,
  p?: (v: T) => R,
): R | T | undefined {
  for (const item of iterable) {
    if (!p) return item;
    const r = p(item!);
    if (r !== null && r !== void 0) return r;
  }
  return void 0;
}

export function last<T>(iterable: Iterable<T>): T | undefined;
export function last<T, R>(
  iterable: Iterable<T>,
  p: (v: T) => R,
): R | undefined;
export function last<T, R>(
  iterable: Iterable<T>,
  p?: (v: T) => R,
): R | T | undefined {
  const arr = Array.from(iterable);
  for (let i = arr.length - 1; i >= 0; --i) {
    const item = arr[i];
    if (!p) return item;
    const r = p(item!);
    if (r !== null && r !== void 0) return r;
  }
  return void 0;
}
