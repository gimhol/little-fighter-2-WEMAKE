import type { IState } from "../../base/FSM";
import { bot_cases } from "../../cases_instances";
import { GK, LGK, StateEnum } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import type { BotController } from "../BotController";

export abstract class BotState_Base implements IState<BotStateEnum> {
  abstract key: BotStateEnum;
  readonly ctrl: BotController
  get world() { return this.ctrl.world }
  get stage() { return this.world.stage }
  constructor(ctrl: BotController) {
    this.ctrl = ctrl;
  }
  random_jumping() {
    const c = this.ctrl;
    const { state } = c.entity.frame;
    const desire = c.desire('rj_1')
    switch (state) {
      case StateEnum.Running:
        if (desire < c.dataset.dash_desire) c.key_down(GK.j).key_up(GK.j)
        break;
      case StateEnum.Standing:
      case StateEnum.Walking:
        if (desire < c.dataset.jump_desire) c.key_down(GK.j).key_up(GK.j)
        break;
    }
  }
  update(dt: number): BotStateEnum | undefined | void {
    if (this.stage.is_stage_finish) return BotStateEnum.StageEnd;
  }
  enter?(): void;
  leave?(): void;

  /**
   * 防御
   * 
   * @returns 当防御时返回true，否则返回false 
   */
  handle_defends(): boolean {
    const { ctrl: c } = this;
    const me = c.entity;

    const target = c.defends.get();
    if (!target) return false;

    // TODO: 不可防御的攻击
    if (!target.defendable) return false

    const dx = target.x - me.position.x;
    const en_facing = target.facing;
    if (dx > 0 && en_facing < 0) c.key_down(GK.R).key_up(GK.L)
    if (dx < 0 && en_facing > 0) c.key_down(GK.L).key_up(GK.R)

    if (c.action_desire('handle_defends') >= c.dataset.d_desire) {
      c.click(GK.d).key_up(GK.L, GK.R)
      return true
    }
    return me.state == StateEnum.Defend;
  }

  handle_block(): boolean {
    const { ctrl: c } = this;
    const { entity: me } = c
    if (me.blockers.size) c.start(GK.a).end(GK.a)
    return !!me.blockers.size
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

    action_ids = bot.states?.[me.state]
    if (action_ids) for (const aid of action_ids) {
      const action = bot.actions[aid];
      const keys = this.ctrl.handle_action(action)
      if (keys) keys_list.push(keys)
    }

    if (!keys_list.length) return false

    me.lf2.mt.mark = 'hba_2'
    const keys = me.lf2.mt.pick(keys_list)
    if (keys) this.ctrl.key_up(...keys).start(...keys).end(...keys)
    if (bot_cases && keys) bot_cases.push(keys.join())
    return true
  }
}

