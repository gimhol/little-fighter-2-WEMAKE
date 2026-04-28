import { ICookedUIInfo } from "./ICookedUIInfo";

type BaseType = 'string' | 'number' | 'boolean'
export type Cls<T> = new (...args: any[]) => T

export interface ITypeJudger<C = unknown> {
  readonly _$_judger: true;
  run(v: any): v is C;
}
/** @deprecated 如有条件，应当更精确的确认内部数据 */
export function unsafe_is_object<T extends unknown>() {
  return judger<T>((v: any): v is T => {
    return typeof v === 'object' && !Array.isArray(v);
  });
}

/** @deprecated 如有条件，应当更精确的确认内部数据 */
export const unsafe_is_array = judger(v => Array.isArray(v))

export function judger<C = unknown>(run: (v: any) => v is C): ITypeJudger<C> {
  return { _$_judger: true as const, run }
}

function is_judger(v: any): v is ITypeJudger {
  if (!v) return false;
  if (!v._$_judger) return false;
  return typeof v.run == 'function';
}

export function find_ui_value(ui: ICookedUIInfo, name: string): unknown | null {
  const value = ui.values?.[name];
  if (value !== null && value !== void 0)
    return value;
  if (!ui.parent) return null;
  return find_ui_value(ui.parent, name)
}

type AllType<T extends BaseType, C> =
  BooleanConstructor |
  NumberConstructor |
  StringConstructor |
  T | Cls<C> | ITypeJudger |
  null;
export function parse_ui_value(ui: ICookedUIInfo, type: null, value: unknown): any | null;
export function parse_ui_value(ui: ICookedUIInfo, type: BooleanConstructor | 'boolean', value: unknown): boolean | null;
export function parse_ui_value(ui: ICookedUIInfo, type: NumberConstructor | 'number', value: unknown): number | null;
export function parse_ui_value(ui: ICookedUIInfo, type: StringConstructor | 'string', value: unknown): string | null;
export function parse_ui_value<T>(ui: ICookedUIInfo, type: ITypeJudger<T>, value: unknown): T | null
export function parse_ui_value<T extends BaseType, C>(ui: ICookedUIInfo, type: Cls<C> | null, value: unknown): C | T | null
export function parse_ui_value<T extends BaseType, C>(ui: ICookedUIInfo, type: AllType<T, C>, value: unknown): C | T | null {
  let ret: unknown = value
  if (ret === null || ret === void 0)
    return null
  if (!ui)
    throw new Error(`[parse_ui_value] failed, ui is not an object, got ${ui}`)
  if (Array.isArray(ui))
    throw new Error(`[parse_ui_value] failed, ui is not an object, got ${ui}`)
  if (typeof ui !== 'object')
    throw new Error(`[parse_ui_value] failed, ui is not an object, got ${ui}`)

  if (typeof ret == 'string' && ret.trim().startsWith("$val:")) {
    ret = find_ui_value(ui, ret.substring(5).trim());
    if (ret === null || ret === void 0)
      return null;
  }
  switch (type) {
    case 'boolean': case Boolean:
      if (typeof ret != 'boolean')
        throw { ui, error: new Error(`[parse_ui_value] failed, value must be boolean, got ${ret}, src: ${value}`) }
      return ret as any
    case 'number': case Number:
      if (typeof ret != 'number')
        throw { ui, error: new Error(`[parse_ui_value] failed, value must be number, got ${ret}, src: ${value}`) }
      return ret as any
    case 'string': case String:
      if (typeof ret != 'string')
        throw { ui, error: new Error(`[parse_ui_value] failed, value must be string, got ${ret}, src: ${value}`) }
      return ret as any
  }
  if (is_judger(type)) {
    if (type.run(ret)) return ret as any
    return null
  }
  if (typeof type === 'function') {
    if (ret instanceof type) return ret as any;
    return null;
  }
  return ret as any;
}