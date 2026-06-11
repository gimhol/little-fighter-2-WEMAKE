type FieldType = '' | 'int' | 'float' | 'boolean' | 'string'
export interface IBaseFieldInfo<T extends object> {
  key: keyof T;
  title?: string;
  desc?: string;
}
export interface INumFieldInfo<T extends object> extends IBaseFieldInfo<T> {
  type: 'int' | 'float';
  min?: number;
  max?: number;
  step?: number;
}

export interface IStrFieldInfo<T extends object> extends IBaseFieldInfo<T> {
  type: 'string';
  maxLength?: number;
}
export interface IAnyFieldInfo<T extends object> extends IBaseFieldInfo<T> {
  type: '' | 'boolean'
}
export type IFieldInfo<T extends object> = IAnyFieldInfo<T> | IStrFieldInfo<T> | INumFieldInfo<T>

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
export const str = assign(<T extends object>(...p: (string | Omit<IStrFieldInfo<T>, 'key' | 'type'>)[]): IRet<T> => w('string', ...p), w('string'))
export const float = assign(<T extends object>(...p: (string | Omit<INumFieldInfo<T>, 'key' | 'type'>)[]): IRet<T> => w('float', ...p), w('float'))
export const int = assign(<T extends object>(...p: (string | Omit<INumFieldInfo<T>, 'key' | 'type'>)[]): IRet<T> => w('int', ...p), w('int'))

export const any = assign(<T extends object>(...p: (string | Omit<IFieldInfo<T>, 'key' | 'type'>)[]): IRet<T> => w('', ...p), w(''))
export function fields<T extends object>(fields: Record<keyof T, IRet<T>>): Map<keyof T, IFieldInfo<T>> {
  const ret = new Map<keyof T, IFieldInfo<T>>();
  for (const k in fields) {
    const key = k as keyof T;
    const value = assign({}, fields[key], { key });
    ret.set(key, value);
  }
  return ret;
}
