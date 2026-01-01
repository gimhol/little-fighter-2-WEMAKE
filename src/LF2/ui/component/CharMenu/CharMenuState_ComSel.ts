import { GameKey } from "@/LF2/defines";
import type { IUIKeyEvent } from "../../IUIKeyEvent";
import type { CharMenuLogic } from "./CharMenuLogic";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_Base } from "./CharMenuState_Base";
import { SlotStep } from "./SlotStep";

export class CharMenuState_ComSel extends CharMenuState_Base {
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

      const com_num = Array.from(this.owner.players.keys()).reduce((r, v) => v.is_com ? r + 1 : r, 0)



      if (state.step === SlotStep.Ready)
        if (com_num >= this.owner.com_num)
          this.owner.fsm.use(CharMenuState.GameSetting)
        else
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
    if (!com) return CharMenuState.PlayerSel;
  }
}
