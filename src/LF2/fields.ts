interface IFieldInfo<T extends object> {
  key: keyof T;
  title?: string;
  type: '' | 'int' | 'float' | 'boolean';
  desc?: string;
  min?: number;
  max?: number;
  step?: number;
}
type IRet<T extends object> = Omit<IFieldInfo<T>, 'key'>
type IArg<T extends object> = string | Omit<IFieldInfo<T>, 'key' | 'type'>
const { assign } = Object
function w<T extends object>(type: IFieldInfo<T>['type'], ...args: IArg<T>[]): IRet<T> {
  const ret: IRet<T> = { type }
  for (let i = 0; i < args.length; i++) {
    const v = args[i];
    if (i == 0 && typeof v === 'string') ret.title = v
    if (i == 0 && typeof v === 'object') assign(ret, v)
    if (i == 1 && typeof v === 'string') ret.desc = v
    if (i == 1 && typeof v === 'object') assign(ret, v)
    if (i > 1 && typeof v === 'object') assign(ret, v)
  }
  return ret
}
export const float = assign(<T extends object>(...p: IArg<T>[]): IRet<T> => w('float', ...p), w('float'))
export const int = assign(<T extends object>(...p: IArg<T>[]): IRet<T> => w('int', ...p), w('int'))
export const invalid = assign(<T extends object>(...p: IArg<T>[]): IRet<T> => w('', ...p), w(''))
export function fields<T extends object>(fields: Record<keyof T, IRet<T>>) {
  const ret = new Map<keyof T, IFieldInfo<T>>();
  for (const k in fields) {
    const key = k as keyof T;
    const value = assign(fields[key], { key });
    ret.set(key, value);
  }
  return ret;
}
