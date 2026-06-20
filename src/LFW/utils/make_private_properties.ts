export function make_private_properties(
  place: string,
  target: any,
  filter: (key: string, target: any) => boolean,
  on_change?: (key: string, curr: any, prev: any) => void
) {
  const keys = Object.keys(target);
  for (const key of keys) {
    if (!(key in target)) continue
    if (key.startsWith('on_')) continue;
    if (key.startsWith('_')) continue;
    if (typeof target[key] === 'function') continue;
    if (!filter(key, target)) continue;
    const pk = '_$_' + key;
    target[pk] = target[key];
    delete target[key];
    const fn_key = `on_${key}_change`
    Object.defineProperty(target, key, {
      get() { return target[pk]; },
      set(v) {
        if (v === target[pk]) return;
        const prev = target[pk]
        target[pk] = v;
        target[fn_key]?.(v, prev)
        on_change?.(key, v, prev)
      }
    });
  }
}
