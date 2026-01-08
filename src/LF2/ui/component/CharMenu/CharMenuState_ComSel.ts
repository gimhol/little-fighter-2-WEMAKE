import { GameKey } from "@/LF2/defines";
import type { IUIKeyEvent } from "../../IUIKeyEvent";
import type { CharMenuLogic } from "./CharMenuLogic";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_Base } from "./CharMenuState_Base";
import { SlotStep } from "./SlotStep";

export class CharMenuState_ComSel extends CharMenuState_Base {
  /** 全部电脑玩家准备就绪 */
  get all_com_ready(): boolean {
    let count = 0;
    for (const [v, s] of this.owner.players) {
      if (!v.is_com) continue;
      if (s.step !== SlotStep.Ready) continue;
      ++count;
    }
    return count === this.owner.com_num
  }
  get com_count(): number {
    let count = 0;
    for (const [v, s] of this.owner.players)
      if (v.is_com)
        ++count;
    return count
  }

  constructor(owner: CharMenuLogic) {
    super(CharMenuState.ComSel, owner);
  }
  override enter() {
    this.owner.add_com();
  }
  override on_key_down(e: IUIKeyEvent) {
    const pair = this.owner.last_com();
    if (e.game_key === GameKey.a) {
      if (!pair) { this.owner.add_com(); return; }
      const [player, state] = pair;
      if (!player.is_com) { this.owner.add_com(); return; }
      if (state.step === SlotStep.Ready) { this.owner.add_com(); return; }
      this.owner.press_a(player);
      if (state.step === SlotStep.Ready)
        if (this.com_count < this.owner.com_num)
          this.owner.add_com();
      return;
    }
    if (!pair) return;
    const [com] = pair;
    switch (e.game_key) {
      case GameKey.j: this.owner.press_j(com); break;
      case GameKey.L: this.owner.press_lr(com, -1); break;
      case GameKey.R: this.owner.press_lr(com, 1); break;
      case GameKey.U: this.owner.press_u(com); break;
      default: return;
    }
    if (!this.owner.players.has(com)) {
      this.lf2.players.delete(com.id);
      const [lc] = this.owner.last_com() ?? [];
      if (lc) this.owner.press_j(lc);
    }
  }
  override update() {
    const [com] = this.owner.last_com() ?? [];
    if (!com) return CharMenuState.ComNumSel;
    if (this.all_com_ready) return CharMenuState.GameSetting;
  }
}
