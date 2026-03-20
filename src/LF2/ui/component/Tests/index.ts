import FSM from "@/LF2/base/FSM";
import { GK } from "@/LF2/defines";
import { IUIKeyEvent } from "../../IUIKeyEvent";
import { UIComponent } from "../UIComponent";
import { FIRZEN_DUA_TEST } from "./FIRZEN_DUA_TEST";
import { JAN_DUA_TEST } from "./JAN_DUA_TEST";
import { JAN_DUJ_TEST } from "./JAN_DUJ_TEST";
import { LOUIS_JUMP_ATTACK_TEST } from "./LOUIS_JUMP_ATTACK_TEST";
import { TestsState } from "./TestsState";

export class Tests extends UIComponent {
  static override readonly TAG = 'Tests';
  readonly fsm = new FSM<number>();
  override init(): void {
    this.fsm.add(
      new TestsState(this),
      new FIRZEN_DUA_TEST(this),
      new JAN_DUA_TEST(this),
      new JAN_DUJ_TEST(this),
      new LOUIS_JUMP_ATTACK_TEST(this),
    )
  }
  override on_key_down(e: IUIKeyEvent): void {
    const len = this.fsm.states.size;
    if (!len) return;
    const state = this.fsm.state?.key;
    if (state == void 0) this.fsm.use(0)
    else if (GK.R === e.game_key) this.fsm.use((state + 1) % len)
    else if (GK.U === e.game_key) this.fsm.use(state)
    else if (GK.L === e.game_key) this.fsm.use((state + len - 1) % len)
  }
  override update(dt: number): void {
    this.fsm.update(dt)
  }
}