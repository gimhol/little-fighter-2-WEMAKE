import { GameKey } from "@/LF2/defines";
import { ceil, max } from "@/LF2/utils";
import type { IUIKeyEvent } from "../../IUIKeyEvent";
import type { CharMenuLogic } from "./CharMenuLogic";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_Base } from "./CharMenuState_Base";

export class CharMenuState_CountingDown extends CharMenuState_Base {
  private _count_down: number = 5000;
  constructor(owner: CharMenuLogic) {
    super(CharMenuState.CountingDown, owner);
  }
  override enter() {
    this._count_down = 5000;
  }
  override on_key_down(e: IUIKeyEvent): void {
    this._count_down = max(0, this._count_down - 500);
    if (this.owner.max_player <= this.owner.players.size) return;
    const player = this.lf2.players.get(e.player);
    if (!player || e.game_key !== GameKey.a || this.owner.players.has(player)) return;
    this.owner.press_a(player);
    this.owner.fsm.use(CharMenuState.PlayerSel);
  }
  override update(dt: number) {
    this._count_down = max(0, this._count_down - dt);
    const num = ceil(this._count_down / 1000);
    this.owner.slots.forEach(v => v.head?.count_down(num));
    if (num > 0) return;
    return this.owner.max_player <= this.owner.players.size ?
      CharMenuState.GameSetting :
      CharMenuState.ComNumSel;
  }
  override leave(): void {
    this.owner.slots.forEach(v => v.head?.count_down(0));
  }
}
