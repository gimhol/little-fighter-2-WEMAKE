import FSM from "@/LF2/base/FSM";
import { GK, IClazz } from "@/LF2/defines";
import { IUIKeyEvent } from "../../IUIKeyEvent";
import { Text } from "../Text";
import { UIComponent } from "../UIComponent";
import { Firzen_DUA } from "./Firezen/Firzen_DUA";
import { Firzen_FUSION } from "./Firezen/Firzen_FUSION";
import { Jan_DUA } from "./Jan/Jan_DUA";
import { Jan_DUJ } from "./Jan/Jan_DUJ";
import { Julian_DFJ } from "./Julian/Julian_DFJ";
import { Julian_DUJ } from "./Julian/Julian_DUJ";
import { LOUIS_JUMP_ATTACK } from "./Louis/LOUIS_JUMP_ATTACK";
import { TestCase } from "./TestCase";

const Cases: IClazz<TestCase, [Tests]>[] = [
  TestCase,
  Julian_DUJ,
  Julian_DFJ,
  Firzen_DUA,
  Firzen_FUSION,
  Jan_DUA,
  Jan_DUJ,
  LOUIS_JUMP_ATTACK,
]
export class Tests extends UIComponent {
  static override readonly TAG = 'Tests';
  readonly fsm = new FSM<number, TestCase>();
  override init(): void {
  }
  override on_start(): void {
    this.fsm.add(...Cases.map(v => new v(this))).use(0)
    this.fsm.callbacks.add({
      on_state_changed: (f) => {
        const n = f.state?.name ?? 'None'
        const nn = this.node.search_component(Text, v => v.id === 'test_case_name')
        nn?.set_text(`Case: ${n}`)
      }
    })
  }
  override on_stop(): void {
    this.world.clear()
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