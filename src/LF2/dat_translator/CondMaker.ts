import type { TBinOp } from "../defines/BinOp";
import { is_str } from "../utils/type_check";
export class CondMaker<T extends string = string> {
  readonly is_cond = true;
  static is = (v: any): v is CondMaker => v?.is_cond === true;

  private _parts: (string | CondMaker)[] = [];

  add(func: (c: CondMaker<T>) => CondMaker<T>): this;
  add(word: T, op: TBinOp, value: any): this;
  add(
    arg1: T | ((c: CondMaker<T>) => CondMaker<T>),
    op?: TBinOp,
    value?: any,
  ): this {
    if (typeof arg1 !== "function") this._parts.push(`${arg1}${op}${value}`);
    else this._parts.push(arg1(new CondMaker()));
    return this;
  }
  not(func: (c: CondMaker<T>) => CondMaker<T>): this {
    this._parts.push("!", func(new CondMaker()));
    return this;
  }
  wrap(func: (c: CondMaker<T>) => CondMaker<T>): this {
    this._parts.push(func(new CondMaker()));
    return this;
  }
  one_of(word: T, ...values: (string | number)[]): this {
    return this.wrap((c) => {
      for (const v of values) c = c.or(word, "==", v);
      return c;
    });
  }
  not_in(word: T, ...values: (string | number)[]): this {
    return this.wrap((c) => {
      for (const v of values) c.and(word, "!=", v);
      return c;
    });
  }
  private _any(
    word?: T | ((c: CondMaker<T>) => CondMaker<T>),
    op?: TBinOp | (string | number)[],
    value?: any,
  ): this {
    if (typeof word === "function") return this.wrap(word);
    else if (word !== void 0)
      if (Array.isArray(op)) return this.one_of(word, ...op);
      else if (op !== void 0 && value !== void 0)
        return this.add(word, op, value);
    return this;
  }
  or(): this;
  or(func: (c: CondMaker<T>) => CondMaker<T>): this;
  or(word: T, op: TBinOp, value: any): this;
  or(
    word?: T | ((c: CondMaker<T>) => CondMaker<T>),
    op?: TBinOp | (string | number)[],
    value?: any,
  ): this {
    this._parts.length && this._parts.push("|");
    return this._any(word, op, value);
  }

  and(): this;
  and(func: (c: CondMaker<T>) => CondMaker<T>): this;
  and(word: T, op: TBinOp, value: any): this;
  and(
    word?: T | ((c: CondMaker<T>) => CondMaker<T>),
    op?: TBinOp,
    value?: any,
  ): this {
    this._parts.length && this._parts.push("&");
    return this._any(word, op, value);
  }
  done(): string {
    let ret = this._parts
      .map((v) => (is_str(v) ? v : `(${v.done()})`))
      .join("");
    ret = ret.replace(/\s|\n|\r/g, ""); // remove empty char;

    // remove redundant bracket;
    if (this._parts.length === 1 && CondMaker.is(this._parts[0]))
      ret = ret.replace(/^\(|\)$/g, "");
    return ret;
  }
}
