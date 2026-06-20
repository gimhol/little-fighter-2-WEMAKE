export function is_arr<T = any>(v: any): v is T[] {
  return Array.isArray(v);
}
