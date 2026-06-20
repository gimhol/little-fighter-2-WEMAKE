/**
 * Entity 生成/发射 相关方法
 *
 * 通过 prototype 挂载到 Entity 类上。
 */
import { sus_cases } from "../cases_instances";
import { collision_clone } from "../collision/Collision";
import {
  Defines,
  type IOpointInfo,
  type IVector3,
  OpointKind,
  OpointMultiEnum,
  OpointSpreading,
  SpeedMode,
  StateEnum,
  type TFace,
} from "../defines";
import { Ditto } from "../ditto";
import { abs, clamp, is_num, round_float } from "../utils";
import type { Entity } from "./Entity";
import { is_ball_ctrl, is_fighter } from "./type_check";

// ============================================================
// on_spawn
// ============================================================

export function on_spawn(
  this: Entity,
  emitter: Entity,
  opoint: IOpointInfo,
  offset_velocity: IVector3 = Ditto.vec3(0, 0, 0),
  facing: TFace = emitter.facing,
): Entity {
  const emitter_frame = emitter.frame;
  if (emitter.state === StateEnum.Ball_Rebounding) {
    const attacker = emitter.lastest_collided?.attacker ?? emitter;
    this._emitters[0] = attacker.id;
    this._emitters.length = 1;
    this.team = attacker.team;
    this.facing = emitter.facing;
  } else {
    this._emitters.push(...emitter.emitters, emitter.id);
    this.team = emitter.team;
    this.facing = emitter.facing;
  }
  const { origin_type } = opoint;
  let { x: pos_x, y: pos_y, z: pos_z } = emitter.position;
  if (origin_type === 1) {
    pos_y = pos_y - opoint.y;
    pos_x = pos_x + emitter.facing * opoint.x;
  } else {
    pos_y = pos_y + emitter_frame.centery - opoint.y;
    pos_x = pos_x - emitter.facing * (emitter_frame.centerx - opoint.x);
  }
  this.set_position(pos_x, pos_y, pos_z + (opoint.z ?? 2));

  const result = this.get_next_frame(opoint.action);
  facing = result?.which.facing
    ? this.handle_facing_flag(result.which.facing)
    : emitter.facing;

  if (result) this.enter_frame(result.which);
  else this.enter_frame(this.find_auto_frame());

  let {
    dvx: o_dvx = 0,
    dvy: o_dvy = 0,
    dvz: o_dvz = 0,
    speedz: o_speedz = this.get_opoint_speed_z(emitter, opoint),
  } = opoint;

  const { weight } = this;
  o_dvy = o_dvy / weight;
  const ud = emitter.ctrl?.UD || 0;
  const { x: ovx, y: ovy, z: ovz } = offset_velocity;
  if (o_dvx > 0) o_dvx = o_dvx / weight - abs(ovz / 2);
  else o_dvx = o_dvx / weight + abs(ovz / 2);

  if (is_num(opoint.max_hp))
    this.hp = this.hp_r = this.hp_max = opoint.max_hp;
  if (is_num(opoint.hp)) this.hp = this.hp_r = opoint.hp;
  if (is_num(opoint.max_mp)) this.mp = this.mp_max = opoint.max_mp;
  if (is_num(opoint.mp)) this.mp = opoint.mp;

  const { dvy = 0, dvz = 0, dvx = 0 } = this;
  const {
    vxm,
    vym,
    vzm,
    acc_x = 0,
    acc_y = 0,
    acc_z = 0,
  } = this.frame;
  const z_disabled =
    result?.frame?.state === StateEnum.Normal ||
    result?.frame?.state === StateEnum.Burning;

  let vx = ovx + o_dvx * facing;
  let vy = ovy + o_dvy + dvy;
  let vz = z_disabled ? 0 : ovz + o_dvz + o_speedz * ud;
  if (vxm === SpeedMode.Fixed) vx = dvx;
  if (vym === SpeedMode.Fixed) vy = dvy;
  if (vzm === SpeedMode.Fixed) vz = dvz;
  if (vxm == SpeedMode.Extra && acc_x) vx += acc_x;
  if (vym == SpeedMode.Extra && acc_y) vy += acc_y;
  if (vzm == SpeedMode.Extra && acc_z) vz += acc_z;

  this._prev_velocity.x = this._velocity.x = round_float(vx);
  this._prev_velocity.y = this._velocity.y = round_float(vy);
  this._prev_velocity.z = this._velocity.z = round_float(vz);
  if (sus_cases.debugging) {
    sus_cases.push("on_spawn::pos", pos_x, pos_y, pos_z);
    sus_cases.push("on_spawn::vec1", vx, vy, vz);
  }
  switch (opoint.kind) {
    case OpointKind.Pick:
      emitter.drop_holding();
      this.bearer = emitter;
      this.bearer.holding = this;
      break;
  }
  this.motionless = opoint.motionless ?? 2;
  return this;
}

// ============================================================
// get_opoint_speed_z
// ============================================================

export function get_opoint_speed_z(
  this: Entity,
  emitter: Entity,
  opoint: IOpointInfo,
): number {
  if (opoint.speedz !== void 0) return opoint.speedz;
  if (!is_fighter(emitter)) return 0;
  switch (this.state) {
    case StateEnum.Ball_Flying:
    case StateEnum.Ball_3006:
    case StateEnum.Weapon_Throwing:
    case StateEnum.HeavyWeapon_InTheSky:
      return Defines.DEFAULT_OPOINT_SPEED_Z;
  }
  return 0;
}

// ============================================================
// apply_opoints
// ============================================================

export function apply_opoints(this: Entity, opoints: IOpointInfo[]): void {
  for (const opoint of opoints) {
    const { interval = 0, interval_id, interval_mode } = opoint;
    const interval_info = this._opoints.find(
      (v) => v[0].interval_id === interval_id,
    );
    if (interval_info && interval_mode === 1) {
      if (interval_info[1] !== opoint.interval) continue;
    } else if (interval > 0) {
      this._opoints.push([opoint, 0]);
    }
    let enemies: ReadonlyArray<Entity> = [];
    let allies: ReadonlyArray<Entity> = [];
    let multi_type: OpointMultiEnum | undefined = void 0;
    let count = 0;
    const multi = opoint.multi ?? 1;
    if (is_num(multi)) {
      count = multi;
    } else if (multi) {
      const { type, min = 0, max = 355, skip_zero } = multi;
      switch ((multi_type = type)) {
        case OpointMultiEnum.AccordingEnemies:
          enemies = this.world.list_enemies(this);
          if (skip_zero && !enemies.length) break;
          count = clamp(enemies.length, min, max);
          break;
        case OpointMultiEnum.AccordingAllies:
          allies = this.world.list_allies(this);
          if (skip_zero && !allies.length) break;
          count = clamp(allies.length, min, max);
          break;
      }
    }
    let facing = this.facing;
    for (let i = 0; i < count; ++i) {
      const v = Ditto.vec3(0, 0, 0);
      switch (opoint.spreading) {
        case void 0:
        case OpointSpreading.Normal:
          v.z = (i - (count - 1) / 2) * 2.5;
          break;
        case OpointSpreading.Spreading:
          if (opoint.__spreading_random_x)
            v.x = opoint.__spreading_random_x.take();
          if (opoint.__spreading_random_y)
            v.y = opoint.__spreading_random_y.take();
          if (opoint.__spreading_random_z)
            v.z = opoint.__spreading_random_z.take();
          facing = v.x < 0 ? -1 : v.x > 0 ? 1 : facing;
          break;
      }
      const e = this.spawn_entity(opoint, v, facing);
      if (!e) return;
      switch (opoint.spreading) {
        case OpointSpreading.FloatRange: {
          const { x, y, z } = e.velocity;
          this.lf2.mt.mark = "ao_x";
          const xx = opoint.__spreading_random_x?.take() ?? x;
          this.lf2.mt.mark = "ao_y";
          const yy = opoint.__spreading_random_y?.take() ?? y;
          this.lf2.mt.mark = "ao_z";
          const zz = opoint.__spreading_random_z?.take() ?? z;
          e.set_velocity(xx, yy, zz);
          break;
        }
      }
      switch (multi_type) {
        case OpointMultiEnum.AccordingEnemies:
          if (e.frame.chase && is_ball_ctrl(e.ctrl))
            e.ctrl.chasing = enemies[i % enemies.length];
          break;
        case OpointMultiEnum.AccordingAllies:
          if (e.frame.chase && is_ball_ctrl(e.ctrl))
            e.ctrl.chasing = allies[i % allies.length];
          break;
      }
      if (opoint.inherit_speed_x)
        e.set_velocity_x(e.velocity.x + this.velocity.x * opoint.inherit_speed_x);
      if (opoint.inherit_speed_y)
        e.set_velocity_y(e.velocity.y + this.velocity.y * opoint.inherit_speed_y);
      if (opoint.inherit_speed_z)
        e.set_velocity_z(e.velocity.z + this.velocity.z * opoint.inherit_speed_z);
    }
  }
}

// ============================================================
// spawn_entity
// ============================================================

export function spawn_entity(
  this: Entity,
  opoint: IOpointInfo,
  offset_velocity: IVector3 = Ditto.vec3(0, 0, 0),
  facing: TFace = this.facing,
): Entity | undefined {
  if (opoint.unimportant && this.world.entities.length > 355) return void 0;
  this.lf2.mt.mark = "se_1";
  const oid = this.lf2.mt.pick(opoint.oid);
  if (!oid) {
    Ditto.warn(
      `[Entity::spawn_object] failed, oid: ${oid}, opoint: `,
      opoint,
    );
    return;
  }
  const data = this.lf2.datas.find(oid);
  if (!data) {
    Ditto.warn(
      `[Entity::spawn_object] failed, oid: ${oid}, data: `,
      data,
      ` opoint: `,
      opoint,
    );
    debugger;
    return;
  }
  const entity = this.lf2.factory.create_entity(this.world, data);
  if (!entity) {
    Ditto.warn(
      `[Entity::spawn_object] failed, oid: ${oid}, data: `,
      data,
      ` opoint: `,
      opoint,
    );
    debugger;
    return;
  }
  entity.ctrl =
    this.lf2.factory.create_ctrl(entity._data.id, "", entity) ?? entity.ctrl;
  entity
    .on_spawn(this, opoint, offset_velocity, facing)
    .attach(opoint.is_entity);
  if (entity.data.id === this.data.id) this.copies.add(entity.id);
  entity.key_role = false;
  entity.dead_gone = true;
  for (const [, v] of this.vrests) entity.add_v_rest(collision_clone(v));
  return entity;
}

// ============================================================
// attach
// ============================================================

export function attach(this: Entity, is_entity = true): Entity {
  this._spawn_time = this.world.game_time;
  this._mounted = 1;
  this._ghosted = is_entity ? 0 : 1;
  this.world.add_entities(this);
  if (this.frame.id === "0" /* EMPTY_FRAME_INFO */)
    this.enter_frame(Defines.NEXT_FRAME_AUTO);
  return this;
}
