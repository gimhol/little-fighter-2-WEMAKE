import { validate_schema } from "@/LF2/utils/schema/validate_schema";
import type { ISchema } from "../../defines/ISchema";
import { is_num, is_str } from "../../utils";
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
  private _any_str_arr(v: any, out: string[] = []): void {
    if (v === void 0 || v === null) return
    if (Array.isArray(v)) for (const i of v) {
      this._any_str_arr(i, out)
    }
    switch (typeof v) {
      case "string":
        out.push(...v.split(','));
        break;
      case "number":
      case "bigint":
      case "boolean":
      case "symbol":
        out.push(v.toString())
        break;
    }
  }
  set_strs(name: string, v: string[]) {
    this.raw[name] = v;
  }
  strs(name: string): string[] | null {
    if (!(name in this.raw)) return null;
    const out: string[] = [];
    this._any_str_arr(this.raw[name], out);
    return out;
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

  validate<P>(Cls: { TAG: string, PROPS: ISchema<P> }): P {
    const { TAG, PROPS } = Cls
    const errors: string[] = [];
    validate_schema(this.raw, PROPS, errors)
    if (!errors.length) return this.raw as P;
    throw new Error(`[${TAG}] props.error:` + errors.join('\n'))
  }

}
