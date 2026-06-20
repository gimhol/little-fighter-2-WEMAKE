export function loop_arr<T>(list: T | T[], fn: (item: T, idx: number, arr: T[]) => any) {
  if (Array.isArray(list)) list.forEach(fn);
  else fn(list, 0, [list])
}
