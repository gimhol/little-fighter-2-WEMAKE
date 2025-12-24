
const ignore_keys = new Set<symbol | string>([
  'constructor',
  '__defineGetter__',
  '__defineSetter__',
  'hasOwnProperty',
  '__lookupGetter__',
  '__lookupSetter__',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toString',
  'valueOf',
  'toLocaleString',
  '__proto__',
])

export default function list_fn(
  obj: any,
  set: Set<symbol | string> = new Set(),
  protos: Set<unknown> = new Set()
) {
  if (!obj || typeof obj !== 'object' || protos.has(obj))
    return set;
  protos.add(obj)
  const keys = Object.getOwnPropertyNames(obj)
  const symbols = Object.getOwnPropertySymbols(obj)
  const all_keys = [...keys, ...symbols];
  for (const key of all_keys) {
    if (ignore_keys.has(key)) continue;
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (!desc || !('value' in desc) || typeof desc.value !== 'function') continue;
    set.add(key);
  }
  const proto = Object.getPrototypeOf(obj);
  list_fn(proto, set, protos);
  return set;
}
