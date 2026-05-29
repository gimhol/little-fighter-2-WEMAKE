import type { IActionHandler } from "../base/IActionHandler";
import type { Collision } from "../collision/Collision";
import { ActionType } from "../defines/ActionType";
import { IAction_ABuff, IAction_VBuff } from "../defines/IAction_ABuff";
import type { IAction_Broadcast } from "../defines/IAction_Broadcast";
import type { IAction_Fusion } from "../defines/IAction_Fusion";
import type { IAction_ReboundVX } from "../defines/IAction_ReboundVX";
import { IAction_StealValue } from "../defines/IAction_StealValue";
import type { IAction_TurnFace } from "../defines/IAction_TurnFace";
import type { IAction_TurnTeam } from "../defines/IAction_TurnTeam";
import { ensure, max, min, round } from "../utils";
import type { Entity } from "./Entity";
import { turn_face } from "./face_helper";
import { is_bot_ctrl } from "./type_check";

export const collision_action_handlers: IActionHandler = {
  a_sound: (a, c) => c.attacker.play_sound(a.data.path, a.data.pos),
  a_next_frame: (a, c) => {
    const nf = c.attacker.get_next_frame(a.data);
    if (!nf) return;
    c.attacker.enter_frame(nf.which);
  },
  a_set_prop: (a, c) => (c.attacker as any)[a.prop_name] = a.prop_value,
  a_broken_defend: () => 0, // 特殊对待，此处留空
  a_defend: () => 0, // 特殊对待，此处留空

  v_sound: (a, c) => c.victim.play_sound(a.data.path, a.data.pos),
  v_next_frame: (a, c) => {
    const nf = c.victim.get_next_frame(a.data);
    if (!nf) return;
    c.victim.enter_frame(nf.which);
  },
  v_set_prop: (a, c) => (c.victim as any)[a.prop_name] = a.prop_value,
  v_broken_defend: () => 0,
  v_defend: () => 0,

  [ActionType.A_REBOUND_VX]: function (action: IAction_ReboundVX, collision: Collision) {
    const { attacker } = collision;
    attacker.set_velocity_x(-attacker.velocity.x);
  },
  [ActionType.V_REBOUND_VX]: function (action: IAction_ReboundVX, collision: Collision) {
    const { victim } = collision;
    victim.set_velocity_x(-victim.velocity.x);
  },
  [ActionType.V_TURN_FACE]: function (action: IAction_TurnFace, collision: Collision) {
    const { victim } = collision;
    victim.facing = turn_face(victim.facing);
  },
  [ActionType.V_TURN_TEAM]: function (action: IAction_TurnTeam, collision: Collision) {
    const { victim, attacker } = collision;
    victim.team = attacker.team;
  },
  [ActionType.FUSION]: function (action: IAction_Fusion, collision: Collision) {
    const { data: { oid, act, time } } = action;
    const { attacker, victim } = collision;
    const lf2 = collision.attacker.lf2;
    const data = lf2.datas.find(oid);
    if (!data) return;

    const a_v = is_bot_ctrl(attacker.ctrl) ? 0 : 1;
    const v_v = is_bot_ctrl(victim.ctrl) ? 0 : 1;
    let fighter_1: Entity;
    let fighter_2: Entity;
    if (a_v > v_v) {
      fighter_1 = attacker;
      fighter_2 = victim;
    } else if (a_v < v_v) {
      fighter_1 = victim;
      fighter_2 = attacker;
    } else if (lf2.mt.int() % 2) {
      fighter_1 = attacker;
      fighter_2 = victim;
    } else {
      fighter_1 = victim;
      fighter_2 = attacker;
    }
    const hp = fighter_1.hp + fighter_2.hp;
    const hp_r = max(hp, fighter_1.hp_r, fighter_2.hp_r);
    fighter_1.dismiss_data = fighter_1.data;
    fighter_1.transform(data);
    fighter_1.hp = min(hp, fighter_1.hp_max);
    fighter_1.hp_r = min(hp_r, fighter_1.hp_max);
    fighter_1.fuse_bys = ensure(fighter_1.fuse_bys, fighter_2);
    fighter_1.dismiss_time = time ?? null;
    fighter_1.mp = fighter_1.mp_max;
    fighter_2.invisible =
      fighter_2.motionless =
      fighter_2.invulnerable = 1000000;
    if (act) {
      const nf = fighter_1.get_next_frame(act);
      if (nf) fighter_1.enter_frame(nf?.which);
    }
  },
  [ActionType.BROADCAST]: (action: IAction_Broadcast, { lf2 }: Collision) => {
    lf2.broadcast(action.data);
  },
  [ActionType.VALUE_STEAL]: (action: IAction_StealValue, collision: Collision) => {
    const { data: d } = action;
    if (!d) return;
    const { real_injury, injury } = collision;
    const { over_injury } = d;
    const itr_value = over_injury ? injury : real_injury;
    if (!itr_value) return;

    let t: Entity | undefined | null;
    const { attacker: a } = collision;
    switch (action.data.target) {
      case 1: t = a.src_emitter; break;
      case 2: t = a.pre_emitter; break;
      case 3: t = a.bearer; break;
      case 0: default: t = a; break;
    }
    if (!t) return;

    if (!d.revive && t.hp <= 0) return;

    if (d.mp) t.mp = min(t.mp + d.mp, t.mp_max);
    if (d.itr_mp_ratio) t.mp = min(t.mp + round(itr_value * d.itr_mp_ratio), t.mp_max);

    if (d.hp_r) t.hp_r = min(t.hp_r + d.hp_r, t.hp_max);
    if (d.itr_hp_r_ratio) t.hp_r = min(t.hp_r + round(itr_value * d.itr_hp_r_ratio), t.hp_max);

    if (d.over_hp_r) {
      if (d.hp) t.hp = min(t.hp + d.hp, t.hp_r);
      if (d.itr_hp_r_ratio) t.hp = min(t.hp + round(itr_value * d.itr_hp_r_ratio), t.hp_r);
    } else {
      if (d.hp) t.hp = min(t.hp + d.hp, t.hp_max);
      if (d.itr_hp_ratio) t.hp = min(t.hp + round(itr_value * d.itr_hp_ratio), t.hp_max);
    }
    t.hp_r = max(t.hp_r, t.hp);
  },
  [ActionType.V_BUFF]: (action: IAction_VBuff, collision: Collision) => {
    const { lf2, world, victim, attacker } = collision;
    const id = action.data.buff + '_' + victim.id;
    let buff = world.buffs.get(id);
    if (!buff) {
      buff = lf2.factory.create_buff(action.data.buff, lf2, id);
      if (!buff) return;
      world.buffs.set(id, buff);
      buff.attacker = attacker.id;
      buff.targets;
    }
    buff.lifetime = 0;
    buff.duration = action.data.duration;
    buff.level += 1;
  },
  [ActionType.A_BUFF]: (action: IAction_ABuff, collision: Collision) => {
    const { lf2, world, attacker } = collision;
    const id = action.data.buff + '_' + attacker.id;
    let buff = world.buffs.get(id);
    if (!buff) {
      buff = lf2.factory.create_buff(action.data.buff, lf2, id);
      if (!buff) return;
      world.buffs.set(id, buff);
      buff.attacker = attacker.id;
      buff.targets;
    }
    buff.lifetime = 0;
    buff.duration = action.data.duration;
    buff.level += 1;
  }
};
