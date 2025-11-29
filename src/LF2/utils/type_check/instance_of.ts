type Cls<T> = new (...args: any[]) => T
export function instance_of<T>(value: any, type: Cls<T>): value is T {
  return typeof type.prototype === "function" && value instanceof type;
}
