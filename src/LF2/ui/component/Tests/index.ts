import FSM from "@/LF2/base/FSM";
import { GK, IClazz } from "@/LF2/defines";
import { IUIKeyEvent } from "../../IUIKeyEvent";
import { Text } from "../Text";
import { UIComponent } from "../UIComponent";
import { Firen_DFJ } from "./Firen/Firen_DFJ";
import { Firzen_DUA } from "./Firezen/Firzen_DUA";
import { Firzen_FUSION } from "./Firezen/Firzen_FUSION";
import { Jan_DUA } from "./Jan/Jan_DUA";
import { Jan_DUJ } from "./Jan/Jan_DUJ";
import { Julian_DFA } from "./Julian/Julian_DFA";
import { Julian_DFJ } from "./Julian/Julian_DFJ";
import { Julian_DUJ } from "./Julian/Julian_DUJ";
import { LOUIS_JUMP_ATTACK } from "./Louis/LOUIS_JUMP_ATTACK";
import { TestCase } from "./TestCase";

const CASE_GROUPS: IClazz<TestCase, [Tests]>[][] = [
  [TestCase], [
    Julian_DUJ,
    Julian_DFJ,
    Julian_DFA
  ], [
    Firzen_DUA,
    Firzen_FUSION
  ], [
    Jan_DUA,
    Jan_DUJ
  ], [
    Firen_DFJ
  ], [
    LOUIS_JUMP_ATTACK
  ],
]
export class Tests extends UIComponent {
  static override readonly TAG = 'Tests';
  readonly fsm = new FSM<number, TestCase>();
  groups: TestCase[][] = []
  override init(): void { }
  override on_start(): void {
    this.groups = CASE_GROUPS.map((cases, x) => cases.map((C, y) => {
      const r = new C(this)
      r.name = `${x}-${y} ${r.name}`
      this.fsm.add(r)
      return r;
    }))
    this.fsm.use(0)
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
    const state = this.fsm.state;
    if (state == void 0) this.fsm.use(0)
    else if (GK.R === e.game_key) this.fsm.use((state.key + 1) % len)
    else if (GK.a === e.game_key) this.fsm.use(state.key)
    else if (GK.L === e.game_key) this.fsm.use((state.key + len - 1) % len)
    else if (GK.U === e.game_key) {
      const len = this.groups.length;
      const gid = this.groups.findIndex(v => v.indexOf(state) >= 0)
      const next_gid = (gid + len - 1) % len;
      const cases = this.groups[next_gid]
      this.fsm.use(cases[cases.length - 1].key)
    }
    else if (GK.D === e.game_key) {
      const len = this.groups.length;
      const gid = this.groups.findIndex(v => v.indexOf(state) >= 0)
      const next_gid = (gid + 1) % len;
      const cases = this.groups[next_gid]
      this.fsm.use(cases[0].key)
    }
  }
  override update(dt: number): void {
    this.fsm.update(dt)
  }
}