import { Unsafe } from "../type_check/Unsafe";

export function find<T>(set: Unsafe<ReadonlySet<T>>, p: (v: T) => unknown): Unsafe<T>;
export function find<T>(array: Unsafe<T[]>, p: (v: T) => unknown): Unsafe<T>;
export function find<K, V>(map: Unsafe<Map<K, V>>, p: (v: [K, V]) => unknown): Unsafe<[K, V]>;
export function find<K extends string | number | symbol, V>(iterable: Unsafe<Record<K, V>>, p: (v: [K, V]) => unknown): Unsafe<[K, V]>;

export function find(p0: any, p1: (...v: any[]) => unknown): any | undefined {
  if (!p0) return void 0;
  if (typeof p0[Symbol.iterator] === 'function')
    for (const v of p0) if (p1(v)) return v;
  for (const k in p0) if (p1([k, p0[k]])) return [k, p0[k]]
}

export function find_last<T>(
  set: Iterable<T>,
  p: (v: T) => unknown,
): T | undefined {
  for (const i of Array.from(set).reverse()) if (p(i)) return i;
}

export function intersection<T>(a: Unsafe<T[]>, b: Unsafe<T[]>, fn = (c1: T, c2: T) => c1 === c2): T[] {
  if (!a || !b) return [];
  return a.filter(c1 => b.some(c2 => fn(c1, c2)));
}

