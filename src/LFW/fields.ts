export interface IBaseFieldInfo<T extends object> {
  key: keyof T;
  title?: string;
  desc?: string;
  options?: { value: any, label?: string, desc?: string }[]
  array?: boolean;
  nullable?: boolean;
}

export interface IIntFieldInfo<T extends object> extends IBaseFieldInfo<T> {
  type: 'int';
  min?: number;
  max?: number;
  step?: number;
  /** 该整数的不同位表示不同开关，配合options使用，UI将渲染为多选 */
  bitFlag?: boolean;
  options?: { value: number, label?: string, desc?: string }[]
}
export interface IFltFieldInfo<T extends object> extends IBaseFieldInfo<T> {
  type: 'float';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: number, label?: string, desc?: string }[]
}
export interface IStrFieldInfo<T extends object> extends IBaseFieldInfo<T> {
  type: 'string';
  maxLength?: number;
  options?: { value: string, label?: string, desc?: string }[]
}
export interface IAnyFieldInfo<T extends object> extends IBaseFieldInfo<T> {
  type: '' | 'boolean'
}
export type IFieldInfo<T extends object> = IAnyFieldInfo<T> | IStrFieldInfo<T> | IIntFieldInfo<T> | IFltFieldInfo<T>
export type FieldType = IFieldInfo<object>['type'];

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
export const flt = assign(<T extends object>(...p: (string | Omit<IFltFieldInfo<T>, 'key' | 'type'>)[]): IRet<T> => w('float', ...p), w('float'))
export const int = assign(<T extends object>(...p: (string | Omit<IIntFieldInfo<T>, 'key' | 'type'>)[]): IRet<T> => w('int', ...p), w('int'))

export const any = assign(<T extends object>(...p: (string | Omit<IFieldInfo<T>, 'key' | 'type'>)[]): IRet<T> => w('', ...p), w(''))
export function fields<T extends object>(fields: Record<keyof T, IRet<T>>): Map<keyof T, IFieldInfo<T>> {
  const ret = new Map<keyof T, IFieldInfo<T>>();
  for (const k in fields) {
    const key = k as keyof T;
    const value = assign({}, fields[key], { key });
    ret.set(key, value as any); // wtf
  }
  return ret;
}
