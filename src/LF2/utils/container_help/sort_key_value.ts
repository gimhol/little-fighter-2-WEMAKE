import { take } from "../../dat_translator/take";

export function sort_key_value<T extends {}>(obj: T, orders: Record<keyof T, number>) {
  const all_keys = new Set(Object.keys(obj));
  const known_keys = new Set(Object.keys(orders).sort((a, b) => (orders as any)[a] - (orders as any)[b]));
  const kvs: [any, any][] = [];
  for (const key of known_keys) {
    const value = take(obj, key);
    all_keys.delete(key);
    kvs.push([key, value]);
  }
  for (const key of all_keys) {
    const value = take(obj, key);
    kvs.push([key, value]);
  }
  for (const [k, v] of kvs) {
    (obj as any)[k] = v;
  }
}
