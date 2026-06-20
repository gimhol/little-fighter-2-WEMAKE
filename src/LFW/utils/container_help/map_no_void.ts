export function map_no_void<T, R>(
  iterable: Iterable<T>,
  p: (v: T) => R,
): NonNullable<R>[] {
  const ret: NonNullable<R>[] = [];
  for (const item of iterable) {
    const r = p(item);
    if (r !== null && r !== void 0) ret.push(r);
  }
  return ret;
}
