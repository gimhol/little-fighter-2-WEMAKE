import { is_fighter } from "@/LF2/entity";
import Invoker from "../../base/Invoker";
import { Entity } from "../../entity/Entity";
import { UIComponent } from "./UIComponent";

export class PlayerScore extends UIComponent {
  static override readonly TAG: string = 'PlayerScore'
  get index(): number { return this.num(0) ?? -1 }
  get lose(): boolean | undefined {
    const { fighter } = this;
    if (!fighter) return void 0;
    if (fighter.hp > 0) return false;
    for (const o of this.world.entities) {
      if (o !== fighter && is_fighter(o) && o.hp > 0 && o.team === fighter.team)
        return false;
    }
    return true;
  }
  get fighter(): Entity | undefined {
    const { index } = this;
    if (index < 0) return void 0;
    const arr = Array.from(this.world.slot_fighters)
    if (index >= arr.length) return void 0
    return arr[index][1];
  }
  private _unmount_job = new Invoker();

  override on_resume(): void {
    super.on_resume();
    this.node.visible = !!this.fighter;
  }

  override on_pause(): void {
    super.on_resume();
    this._unmount_job.invoke_and_clear();
  }
}
