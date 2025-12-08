import { Summary } from "./Summary";

export class SummaryMgr {
  protected _graves: Summary[] = [];
  protected _items = new Map<string, Summary>();
  public get(id: string): Summary {
    let ret = this._items.get(id);
    if (!ret) this._items.set(id, ret = this.acquire(id));
    return ret;
  }
  public clear(): void {
    const keys = Array.from(this._items.keys());
    keys.forEach(k => this.release(k));
  }
  public release(id: string): void {
    const item = this._items.get(id);
    if (!item) return;
    item.release();
    this._items.delete(id);
    this._graves.push(item);
  }
  protected acquire(id: string): Summary {
    let ret = this._graves.pop();
    if (ret) ret.reset(id);
    else ret = new Summary(id);
    return ret;
  }
}
export const summary_mgr: SummaryMgr = new SummaryMgr();