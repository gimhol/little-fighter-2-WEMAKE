
type TKey = string | number | symbol;

/**
 * 遍历object，生成键值对数组
 *
 * @export
 * @template {TKey} K 
 * @template V 
 * @param {Record<K, V>} r 
 * @returns {[K, V, Record<K, V>][]} 
 */
export function traversal<K extends TKey, V>(
  r: Record<K, V>,
): [K, V, Record<K, V>][];

export function traversal<O>(
  r: O | undefined,
  func: (k: keyof O, v: O[typeof k], r: O) => void,
): void;

export function traversal<K extends TKey, V>(
  r: Record<K, V> | undefined,
  func?: (k: K, v: V, r: Record<K, V>) => void,
): (readonly [K, V, Record<K, V>])[] | void {
  const items = r ? Object.keys(r).map((_k) => {
    const k = _k as K;
    func?.(k, r[k], r);
    return [k, r[k], r] as const;
  }) : [];
  if (!func) return items;
}

