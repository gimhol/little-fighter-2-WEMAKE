import { SchemaValidator } from "@/LF2/utils/schema/validate_schema";
import type { ISchema } from "../../defines/ISchema";
import { is_num, is_str } from "../../utils";
import read_nums from "../utils/read_nums";
import type { UIComponent } from "./UIComponent";
import { isUIComponentClass } from "./isUIComponentClass";
export interface IUIPropsCallback { }
export class UIProps {
  readonly raw: { [x in string]?: any };
  readonly owner: UIComponent<unknown, any>;
  readonly validator = new SchemaValidator().instance_getter((value, clazz) => {
    if (isUIComponentClass(clazz)) {
      return this.owner.node.root.search_component(clazz, v => v.id === value)
    }
    return null
  }).instance_setter((value, clazz) => {

  })
  constructor(raw: { [x in string]?: any }, owner: UIComponent<unknown, any>) {
    this.raw = { ...raw };
    this.owner = owner;
  }
  num(name: string): number | null {
    if (!(name in this.raw)) return null;
    const v = this.raw[name];
    return is_num(v) ? v : null;
  }
  set_num(name: string, v: number | null) {
    this.raw[name] = v;
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
  component() {
    return this.owner.node.search_component
  }
  validate<P>(Cls: { TAG: string, PROPS: ISchema<P> }): P {
    const { TAG, PROPS } = Cls
    const errors: string[] = [];
    this.validator.validate(this.raw, PROPS, errors)
    if (!errors.length) return this.raw as P;
    throw new Error(`[${TAG}] props.error:` + errors.join('\n'))
  }

}
