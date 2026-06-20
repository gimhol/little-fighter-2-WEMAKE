export function map_arr<T, V>(list: T | T[] | null | undefined, fn: (item: T, idx: number, arr: T[]) => V): V[] {
  if (!list) return []
  if (Array.isArray(list)) return list.map(fn);
  else return [fn(list, 0, [list])];
}
