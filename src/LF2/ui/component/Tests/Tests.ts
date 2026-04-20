import { BotAvoiding, FasterSlowerStandUp } from "@/LF2";
import { FSM } from "../../../base/FSM";
import { GK, IClazz } from "../../../defines";
import { IUIKeyEvent } from "../../IUIKeyEvent";
import { Label } from "../Label";
import { UIComponent } from "../UIComponent";
import { MoonTest } from "./Bg/Moon";
import { Firen_DFA, Firen_DFJ, Firen_DUJ, Firen_DVJ } from "./Firen";
import { Firzen_DUA, Firzen_FUSION } from "./Firezen";
import { Freeze_DFA, Freeze_DFJ, Freeze_DUJ, Freeze_DVJ } from "./Freeze";
import { Jan_DUA, Jan_DUJ } from "./Jan";
import { Julian_DFA, Julian_DFJ, Julian_DUJ } from "./Julian";
import { Bat_DUJ_0, Bat_DUJ_1, Bat_DUJ_2 } from "./Bat";
import { LOUIS_JUMP_ATTACK } from "./Louis";
import { BottomsUp, Come, MoveStayCome } from "./Others";
import { Rudolf_DFJ } from "./Rudolf";
import { TestCase } from "./TestCase";

const CASE_GROUPS: IClazz<TestCase, [Tests]>[][] = [
  [TestCase], [
    Julian_DUJ,
    Julian_DFJ,
    Julian_DFA
  ], [
    Firzen_DUA,
    Firzen_FUSION
  ], [Bat_DUJ_0, Bat_DUJ_1, Bat_DUJ_2], [
    Jan_DUA,
    Jan_DUJ
  ], [
    Rudolf_DFJ
  ], [
    Firen_DUJ,
    Firen_DFA,
    Firen_DFJ,
    Firen_DVJ,
  ], [
    Freeze_DUJ,
    Freeze_DFA,
    Freeze_DFJ,
    Freeze_DVJ,
  ], [
    LOUIS_JUMP_ATTACK
  ], [
    MoonTest
  ], [
    BottomsUp,
    MoveStayCome,
    Come,
    FasterSlowerStandUp,
  ], [
    BotAvoiding
  ]
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
        const nn = this.node.search_component(Label, v => v.id === 'test_case_name')
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