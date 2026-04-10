import type { IClazz } from "../../defines/ISchema";
export function isClass<C>(cls: unknown, clazz: IClazz<C>): cls is IClazz<C> {
  if (!cls) return false;
  if (cls == clazz) return true;
  do {
    const parent = Object.getPrototypeOf(cls);
    if (parent == clazz) return true;
    if (parent === Function.prototype) return false;
    cls = parent;
  } while (cls);
  return false;
}
