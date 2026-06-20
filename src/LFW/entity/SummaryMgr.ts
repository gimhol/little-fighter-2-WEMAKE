import { is_independent } from "../defines/TeamEnum";
import { Entity } from "./Entity";
import { Summary } from "./Summary";
import { is_fighter } from "./type_check";

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
  add_damage_sum(a: Entity, value: number) {
    this.get(a.id).damage_sum += value;
    if (is_independent(a.team)) this.get(a.team).damage_sum += value;
  }
  add_kill_sum(a: Entity, value: number = 1) {
    this.get(a.id).kill_sum += value;
    if (is_independent(a.team)) this.get(a.team).kill_sum += value;
  }
  apply_damage(a: Entity, injury: number, v: Entity, prev_hp: number) {
    this.add_damage_sum(a, injury);
    
    // 分身击杀则不计算
    if (is_fighter(v) && !v.emitters.length && v.hp <= 0 && prev_hp > 0)
      summary_mgr.add_kill_sum(a)
  }
}
export const summary_mgr: SummaryMgr = new SummaryMgr();