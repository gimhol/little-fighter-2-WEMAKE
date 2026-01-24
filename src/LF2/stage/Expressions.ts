import { IExpression } from "../defines";
import { min } from "../utils";

export class Expressions<T> {
  protected _list: IExpression<T>[] = [];
  protected _index: number = 0;
  get list(): Readonly<IExpression<T>[]> { return this._list }
  get is_first() { return this._index <= 0 }
  get is_last() { return this._index >= this._list.length - 1 }

  reset(list: IExpression<T>[]): void {
    this._index = 0;
    if (this._list === list) return;
    this._list.length = 0;
    if (list?.length) this._list.push(...list);
  }
  run(arg: T): boolean {
    const i = this._index;
    if (i < 0 || i >= this._list.length) return false
    return !!this._list[i].run(arg);
  }
  next(): void {
    this._index = min(this._index + 1, this._list.length - 1);
  }
  flow(arg: T): boolean {
    let pass = false
    do {
      const { is_last } = this;
      pass = this.run(arg)
      if (!pass || is_last) break;
      this.next();
    } while (1)
    return pass
  }
}
