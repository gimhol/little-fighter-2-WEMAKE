import { bot_cases } from "@/LF2/cases_instances";
import type { IState } from "../../base/FSM";
import { KEY_NAME_LIST } from "../../controller";
import { GK, ItrKind, LGK, StateEnum } from "../../defines";
import type { BotStateEnum } from "../../defines/BotStateEnum";
import { find } from "../../utils";
import type { BotController } from "../BotController";

export abstract class BotState_Base implements IState<BotStateEnum> {
  abstract key: BotStateEnum;
  readonly ctrl: BotController
  constructor(ctrl: BotController) {
    this.ctrl = ctrl;
  }
  defend_test(): boolean {
    const { ctrl: c } = this;
    const me = c.entity;
    const m_facing = me.facing
    const en = c.defends.get()?.entity;
    if (!en) {
      c.desire('dt_F')
      return false
    }
    if (c.desire('dt_P') > c.d_desire) return false
    const e_facing = en.facing
    if (e_facing == m_facing) { // 回头防御。
      if (e_facing < 0) c.key_down(GK.R).key_up(GK.L)
      else c.key_down(GK.L).key_up(GK.R)
    }
    c.start(GK.d).end(GK.d)
    c.desire('dt_T')
    return true;
  }
  random_jumping() {
    const c = this.ctrl;
    const { state } = c.entity.frame;
    const desire = c.desire('rj_1')
    switch (state) {
      case StateEnum.Running:
        if (desire < c.dash_desire) c.key_down(GK.j).key_up(GK.j)
        break;
      case StateEnum.Standing:
      case StateEnum.Walking:
        if (desire < c.jump_desire) c.key_down(GK.j).key_up(GK.j)
        break;
    }
  }
  update(dt: number): BotStateEnum | undefined | void {
    const c = this.ctrl
    const me = c.entity;
    if (c.world.stage.is_stage_finish) {
      c.key_down(GK.R).key_up(...KEY_NAME_LIST);
      if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
        c.start(GK.a).end(GK.a);
      }
    }
  }
  enter?(): void;
  leave?(): void;
  handle_defends(): boolean {
    const { ctrl: c } = this;
    const me = c.entity;
    if (
      c.defends.targets.length <= 0 ||
      c.action_desire('handle_defends_1') < c.d_desire
    ) return me.frame.state === StateEnum.Defend;

    if (c.defends.targets[0].defendable === 1) {
      const dx = c.defends.targets[0].entity.position.x - me.position.x
      const t_facing = c.defends.targets[0].entity.facing
      if (dx > 0 && t_facing < 0) c.key_down(GK.R).key_up(GK.L)
      if (dx < 0 && t_facing > 0) c.key_down(GK.L).key_up(GK.R)
      c.click(GK.d).key_up(GK.L, GK.R)
    } else {
      // 不可防御的攻击
    }
    return true
  }
  handle_block() {
    const { ctrl: c } = this;
    const { entity: me } = c
    if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
      c.start(GK.a).end(GK.a)
    }
  }


  handle_bot_actions(): boolean {
    const { ctrl: c } = this;
    const me = c.entity;
    const { bot } = me.data.base

    if (!bot) return false;
    const keys_list: LGK[][] = []
    let action_ids = bot.frames?.[me.frame.id]
    if (action_ids) for (const aid of action_ids) {
      const action = bot.actions[aid];
      const keys = this.ctrl.handle_action(action)
      if (keys) keys_list.push(keys)
    }

    action_ids = bot.states?.[me.frame.state]
    if (action_ids) for (const aid of action_ids) {
      const action = bot.actions[aid];
      const keys = this.ctrl.handle_action(action)
      if (keys) keys_list.push(keys)
    }

    if (!keys_list.length) return false

    me.lf2.mt.mark = 'hba_2'
    const keys = me.lf2.mt.pick(keys_list)
    if (keys) this.ctrl.start(...keys).end(...keys)
    if (bot_cases && keys) bot_cases.push(keys.join())
    return true
  }
}
