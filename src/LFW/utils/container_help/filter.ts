export function filter<T>(set: Iterable<T>, p: (v: T) => unknown): T[] {
  const ret: T[] = [];
  for (const i of set) p(i) && ret.push(i);
  return ret;
}
