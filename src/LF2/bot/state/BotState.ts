
import type { IState } from "../../base/FSM";
import { bot_cases } from "../../cases_instances";
import { GK, StateEnum, type LGK } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import type { Difficulty } from "../../defines/Difficulty";
import type { Entity } from "../../entity/Entity";
import type { Stage } from "../../stage/Stage";
import { abs, round } from "../../utils/math";
import type { World } from "../../World";
import type { BotController } from "../BotController";
import { closest } from "./closest";

export abstract class BotState_Base implements IState<BotStateEnum> {
  abstract key: BotStateEnum;
  readonly ctrl: BotController;
  get world(): World { return this.ctrl.world }
  get difficulty(): Difficulty { return this.world.difficulty }
  get stage(): Stage { return this.world.stage }

  get s(): Stage { return this.stage }
  get c(): BotController { return this.ctrl }
  get me(): Entity { return this.ctrl.entity }
  get en(): Entity | undefined { return this.ctrl.chasings.get()?.entity }
  get av(): Entity | undefined { return this.ctrl.avoidings.get()?.entity }
  constructor(ctrl: BotController) {
    this.ctrl = ctrl;
  }
  closest(...list: (Entity | undefined)[]): Entity | undefined {
    return closest(this.me, ...list);
  }
  wanted_jumping(): boolean {
    const c = this.ctrl;
    const desire = c.desire('wj_1')
    const ret = desire < c.dataset.jump_desire * 2
    if (ret)
      c.click(GK.j)
    return ret
  }

  random_jumping(): boolean {
    const c = this.ctrl;
    const { state } = c.entity.frame;
    const desire = c.desire('rj_1')
    switch (state) {
      case StateEnum.Running: {
        const ret = desire < c.dataset.dash_desire;
        if (ret) c.click(GK.j)
        return ret;
      }
      case StateEnum.Standing:
      case StateEnum.Walking: {
        const ret = desire < c.dataset.jump_desire;
        if (ret) c.click(GK.j)
        return ret;
      }
    }
    return false;
  }
  update?(dt: number): BotStateEnum | undefined;
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

    // TODO: 是否会存在倒着飞的玩意?
    if (dx >= 0 && en_facing < 0 && me.facing < 0)
      c.click(GK.R);

    if (dx <= 0 && en_facing > 0 && me.facing > 0)
      c.click(GK.L)

    if (c.desire('handle_defends') >= c.defend_desire) {
      c.click(GK.d)
      return true
    }
    return me.state == StateEnum.Defend;
  }

  handle_block(): boolean {
    const { ctrl: c } = this;
    const { entity: me } = c
    if (me.blockers.size)
      c.key_down(GK.a).key_up(GK.a)
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

