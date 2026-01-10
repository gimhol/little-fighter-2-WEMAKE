import { GameKey } from "@/LF2/defines";
import type { IUIKeyEvent } from "../../IUIKeyEvent";
import type { CharMenuLogic } from "./CharMenuLogic";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_Base } from "./CharMenuState_Base";
import { SlotStep } from "./SlotStep";

export class CharMenuState_PlayerSel extends CharMenuState_Base {
  constructor(owner: CharMenuLogic) {
    super(CharMenuState.PlayerSel, owner);
  }
  override on_key_down(e: IUIKeyEvent): void {
    const player = this.lf2.players.get(e.player);
    if (!player) return;
    switch (e.game_key) {
      case GameKey.L: this.owner.press_lr(player, -1); break;
      case GameKey.R: this.owner.press_lr(player, +1); break;
      case GameKey.a: this.owner.press_a(player); break;
      case GameKey.j: this.owner.press_j(player); break;
      case GameKey.U: this.owner.press_u(player); break;
      case GameKey.D: break;
      case GameKey.d: break;
    }
  }
  override enter(): void {
    const coms = Array.from(this.owner.players.keys()).filter(v => v.is_com);
    for (const com of coms) this.owner.players.delete(com);
    this.owner.update_slots();
  }
  override update(dt: number): void | CharMenuState | undefined {
    const { players } = this.owner
    let all_ready = players.size > 0;
    for (const [, { step }] of players) {
      if (step === SlotStep.Ready) continue;
      all_ready = false;
      break;
    }
    if (all_ready) return CharMenuState.CountingDown
  }
}
