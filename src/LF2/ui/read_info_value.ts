import { Unsafe } from "../utils";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { instance_of } from "../utils";

type BaseType = 'string' | 'number' | 'boolean'
export type Cls<T> = new (...args: any[]) => T
type Judger = ((v: any) => boolean) & { readonly _judger: true }
/** @deprecated 如有条件，应当更精确的确认内部数据 */
export const unsafe_is_object = judger(v => typeof v === 'object' && !Array.isArray(v))
/** @deprecated 如有条件，应当更精确的确认内部数据 */
export const unsafe_is_array = judger(v => Array.isArray(v))
export function judger(fn: (v: any) => boolean): Judger {
  return Object.assign(function (v: any) { return fn(v) }, { _judger: true as true })
}
function is_judger(v: any): v is Judger {
  return typeof v === 'function' && v._judger === true;
}
export function find_ui_value(ui_info: ICookedUIInfo, type: 'boolean', name: string): boolean | null;
export function find_ui_value(ui_info: ICookedUIInfo, type: 'number', name: string): number | null;
export function find_ui_value(ui_info: ICookedUIInfo, type: 'string', name: string): string | null;
export function find_ui_value<C>(ui_info: ICookedUIInfo, type: Cls<C>, name: string): C | null;
export function find_ui_value<C>(ui_info: ICookedUIInfo, type: Judger, name: string): C | null;
export function find_ui_value<T extends BaseType, C>(ui_info: ICookedUIInfo, type: T | Cls<C> | Judger, name: string): C | T | null;
export function find_ui_value<T extends BaseType, C>(ui_info: ICookedUIInfo, type: T | Cls<C> | Judger, name: string): C | T | null {
  const value = ui_info.values?.[name];
  if (value === null || value === undefined)
    return ui_info.parent ? find_ui_value(ui_info.parent, type, name) : null
  if (typeof type === 'string') return typeof value === type ? value : null;
  if (is_judger(type)) return type(value) ? value : null
  if (instance_of(value, type)) return value;
  return null;
}

export function parse_ui_value(ui_info: ICookedUIInfo, type: 'boolean', value: Unsafe<boolean | string>): boolean | null;
export function parse_ui_value(ui_info: ICookedUIInfo, type: 'number', value: Unsafe<number | string>): number | null;
export function parse_ui_value(ui_info: ICookedUIInfo, type: 'string', value: Unsafe<string>): Unsafe<string>;
export function parse_ui_value(ui_info: ICookedUIInfo, type: 'string', value: string): string;
export function parse_ui_value<C>(ui_info: ICookedUIInfo, type: Cls<C>, value: Unsafe<C | string>): C | null
export function parse_ui_value<C>(ui_info: ICookedUIInfo, type: Judger, value: Unsafe<C | string>): C | null
export function parse_ui_value<T extends BaseType, C>(ui_info: ICookedUIInfo, type: T | Cls<C> | Judger, value: Unsafe<T | string>): C | T | null
export function parse_ui_value<T extends BaseType, C>(ui_info: ICookedUIInfo, type: T | Cls<C> | Judger, value: Unsafe<T | string>): C | T | null {
  if (value === null || value === undefined)
    return null
  if (typeof value !== 'string')
    return value;
  if (ui_info && value.startsWith("$val:"))
    return find_ui_value(ui_info, type, value.substring(5).trim()) as T;
  return value as T;
}
