export function take_number(v: any, k: any): number | undefined;
export function take_number<T>(v: any, k: any, or: T): number | T;
export function take_number<T>(v: any, k: any, or?: T): number | T | undefined {
  const ret = typeof v[k] === "number" ? v[k] : or;
  delete v[k];
  return ret;
}
