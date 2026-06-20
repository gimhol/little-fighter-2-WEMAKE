export function make_arr<T>(size: number, fn: (i: number) => T): T[] {
  const ret = [];
  for (let i = 0; i < size; ++i) ret.push(fn(i));
  return ret;
}
