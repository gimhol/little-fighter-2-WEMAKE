import type { IMetas } from "../../defines/IMetaInfo";
import { is_num, is_str } from "../../utils";
import { validate_object_with_metas } from "../utils";
import read_nums from "../utils/read_nums";

export interface IUIPropsCallback { }
export class UIProps {
  readonly raw: { [x in string]?: any };
  constructor(raw: { [x in string]?: any }) { this.raw = raw; }
  num(name: string): number | null {
    if (!(name in this.raw)) return null;
    const v = this.raw[name];
    return is_num(v) ? v : null;
  }
  str<T extends string = string>(name: string, one_of?: T[]): T | null {
    if (!(name in this.raw)) return null;
    const ret: T = this.raw[name];
    if (!is_str(ret)) return null;
    if (!one_of?.length) return ret;
    if (one_of.some(a => a === ret)) return ret;
    return null;
  }
  bool(name: string): boolean | null {
    if (!(name in this.raw)) return null;
    const v = this.raw[name];
    return !['false', '0'].some(b => b === '' + v);
  }
  nums(name: string, len: 4, fallbacks?: number[]): [number, number, number, number];
  nums(name: string, len: 3, fallbacks?: number[]): [number, number, number];
  nums(name: string, len: 2, fallbacks?: number[]): [number, number];
  nums(name: string, len: 1, fallbacks?: number[]): [number];
  nums(name: string, len: number, fallbacks?: number[]): number[];
  nums(name: string, len: number, fallbacks?: number[]): number[] {
    return read_nums(this.raw[name], len, fallbacks);
  }

  validate<P>(name: string, metas: IMetas<P>): P {
    const errors = validate_object_with_metas(this.raw, metas)
    if (!errors.length) return this.raw as P;
    throw new Error(`[${name}] props.error:` + errors.join('\n'))
  }
}
