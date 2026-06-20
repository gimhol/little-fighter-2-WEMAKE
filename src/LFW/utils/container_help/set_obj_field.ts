export function set_obj_field<T extends {}, K extends keyof T>(
  target: T | undefined,
  key: K,
  value: T[K],
): T {
  if (!target) target = {} as T;
  target[key] = value;
  return target;
}
