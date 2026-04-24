import type { LF2 } from "../LF2";
import type { ICookedUIInfo } from "../ui/ICookedUIInfo";

export class UIHelper {
  readonly lf2: LF2;
  protected _all: ICookedUIInfo[] = []
  get all(): ReadonlyArray<ICookedUIInfo> {
    return this._all
  }
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  clear(): this {
    this._all = [];
    return this
  }
  add(...uis: ICookedUIInfo[]): this {
    this._all.push(...uis);
    for (const { id } of uis) {
      Object.assign(this, {
        ['push_' + id]: (stack_idx = 0) => this.lf2.push_ui({ id }, stack_idx),
        ['switch_' + id]: (stack_idx = 0) => this.lf2.set_ui({ id }, stack_idx),
      })
    }

    return this;
  }
}