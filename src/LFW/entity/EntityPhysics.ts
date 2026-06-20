/**
 * Entity 物理/移动 相关方法
 *
 * 通过 prototype 挂载到 Entity 类上，使用 `this: Entity` 进行类型标注。
 */
import type { IVelocityInfo } from "../defines";
import { SpeedCtrl, SpeedMode } from "../defines";
import { pow, round_float } from "../utils";
import { calc_v } from "./calc_v";
import type { Entity } from "./Entity";

const rf = round_float;

// ============================================================
// getter: dvx, dvy, dvz
// ============================================================

export function get_dvx(this: Entity): number | undefined {
  const { dvx: v } = this.frame;
  return v ? v * (this.dataset("fvx_f") as number) : v;
}

export function get_dvy(this: Entity): number | undefined {
  const { dvy: v } = this.frame;
  return v ? v * (this.dataset("fvy_f") as number) : v;
}

export function get_dvz(this: Entity): number | undefined {
  const { dvz: v } = this.frame;
  return v ? v * (this.dataset("fvz_f") as number) : v;
}

// ============================================================
// 重力处理
// ============================================================

export function handle_gravity(this: Entity): void {
  if (this.bearer || this.catcher || this.shaking || this.motionless) return;
  const { gravity_enabled = true } = this.frame;
  if (this.position.y <= this.ground_y || !gravity_enabled) return;
  this._velocity.y = rf(
    this._velocity.y - this.gravity * this._atom_time,
  );
}

// ============================================================
// 速度更新
// ============================================================

export function update_velocity(this: Entity, vinfo: IVelocityInfo): void {
  if (this.bearer || this.catcher || this.shaking || this.motionless) return;
  const { atom_time } = this.world;

  let { dvx, dvy, dvz } = vinfo;
  if (dvx) dvx = rf(dvx * this.dataset("fvx_f"));
  if (dvy) dvy = rf(dvy * this.dataset("fvy_f"));
  if (dvz) dvz = rf(dvz * this.dataset("fvz_f"));
  let {
    vxm = SpeedMode.LF2,
    vym = SpeedMode.AccTo,
    vzm = SpeedMode.LF2,
    acc_x,
    acc_y,
    acc_z,
    ctrl_x = 0,
    ctrl_y = 0,
    ctrl_z = 0,
  } = vinfo;

  // 此处不要 * atom_time
  if (
    (vxm == SpeedMode.AccTo || vxm == SpeedMode.FixedAccTo) &&
    acc_x == void 0 &&
    dvx
  )
    acc_x = dvx;
  if (
    (vym == SpeedMode.AccTo || vym == SpeedMode.FixedAccTo) &&
    acc_y == void 0 &&
    dvy
  )
    acc_y = dvy;
  if (
    (vzm == SpeedMode.AccTo || vzm == SpeedMode.FixedAccTo) &&
    acc_z == void 0 &&
    dvz
  )
    acc_z = dvz;
  if (acc_x) acc_x = rf(acc_x * atom_time);
  if (acc_y) acc_y = rf(acc_y * atom_time);
  if (acc_z) acc_z = rf(acc_z * atom_time);

  let { x: vx, y: vy, z: vz } = this._velocity;
  const { UD, LR, jd } = this._ctrl;
  const { facing } = this;
  if (dvx == void 0) {
    /* noop */
  } else if (!ctrl_x) vx = calc_v(vx, dvx, vxm, acc_x, facing);
  else if (LR != 0 && SpeedCtrl.Control == ctrl_x)
    vx = calc_v(vx, dvx, vxm, acc_x, LR);
  else if (LR != 0 && SpeedCtrl.Enable == ctrl_x)
    vx = calc_v(vx, dvx, vxm, acc_x, 1);
  else if (LR == 0 && SpeedCtrl.Disable == ctrl_x)
    vx = calc_v(vx, dvx, vxm, acc_x, 1);

  if (dvy == void 0) {
    /* noop */
  } else if (!ctrl_y) vy = calc_v(vy, dvy, vym, acc_y, 1);
  else if (jd != 0 && SpeedCtrl.Control == ctrl_y)
    vy = calc_v(vy, dvy, vym, acc_y, jd);
  else if (jd != 0 && SpeedCtrl.Enable == ctrl_y)
    vy = calc_v(vy, dvy, vym, acc_y, 1);
  else if (jd == 0 && SpeedCtrl.Disable == ctrl_y)
    vy = calc_v(vy, dvy, vym, acc_y, 1);

  if (dvz == void 0) {
    /* noop */
  } else if (!ctrl_z) vz = calc_v(vz, dvz, vzm, acc_z, 1);
  else if (UD != 0 && SpeedCtrl.Control == ctrl_z)
    vz = calc_v(vz, dvz, vzm, acc_z, UD);
  else if (UD != 0 && SpeedCtrl.Enable == ctrl_z)
    vz = calc_v(vz, dvz, vzm, acc_z, 1);
  else if (UD == 0 && SpeedCtrl.Disable == ctrl_z)
    vz = calc_v(vz, dvz, vzm, acc_z, 1);

  this._velocity.x = rf(vx);
  this._velocity.y = rf(vy);
  this._velocity.z = rf(vz);
}

// ============================================================
// 地面速度衰减
// ============================================================

export function handle_ground_velocity_decay(
  this: Entity,
  factor: number = 1,
): void {
  if (
    this.position.y > this.ground_y ||
    this.shaking ||
    this.motionless
  )
    return;
  const landing = this._landing_frame === this.frame;
  factor *=
    landing
      ? this.dataset("land_friction_factor")
      : this.dataset("friction_factor");
  const fx = landing
    ? this.dataset("land_friction_x")
    : this.dataset("friction_x");
  const fz = landing
    ? this.dataset("land_friction_z")
    : this.dataset("friction_z");
  handle_velocity_decay.call(this, fx, fz, factor);
}

export function handle_velocity_decay(
  this: Entity,
  accx: number,
  accz: number = accx,
  factor: number = 1,
): void {
  let { x, z } = this.velocity;
  const { atom_time } = this.world;
  x = rf(x * pow(factor, atom_time));
  z = rf(z * pow(factor, atom_time));
  accx = rf(accx * atom_time);
  accz = rf(accz * atom_time);
  const { ctrl_x, ctrl_z } = this.frame;
  let { dvx = 0, dvz = 0 } = this;
  const { UD, LR } = this.ctrl;
  if (ctrl_x && !LR) dvx = 0;
  if (ctrl_z && !UD) dvz = 0;
  if (x > dvx) {
    x -= accx;
    if (x < dvx) x = dvx;
  } else if (x < -dvx) {
    x += accx;
    if (x > -dvx) x = -dvx;
  }
  if (z > dvz) {
    z -= accz;
    if (z < dvz) z = dvz;
  } else if (z < -dvz) {
    z += accz;
    if (z > -dvz) z = -dvz;
  }
  this.set_velocity_x(x);
  this.set_velocity_z(z);
}

// ============================================================
// 位置更新
// ============================================================

export function update_position(this: Entity): void {
  if (this.bearer || this.catcher || this.shaking || this.motionless) return;
  let { x: vx, y: vy, z: vz } = this._velocity;
  const { atom_time } = this.world;
  for (const [, v] of this.blockers) {
    if (
      (vx < 0 && v.attacker.position.x < this.position.x) ||
      (vx > 0 && v.attacker.position.x > this.position.x)
    ) {
      vx = 0;
      this._prev_velocity.x = 0;
    }
    if (
      (vz < 0 && v.attacker.position.z < this.position.z) ||
      (vz > 0 && v.attacker.position.z > this.position.z)
    ) {
      vz = 0;
      this._prev_velocity.z = 0;
    }
  }
  if (!this.shaking && !this.motionless) {
    this._prev_position.set(
      this.position.x,
      this.position.y,
      this.position.z,
    );
    this.set_position(
      this.position.x + (vx + this._prev_velocity.x) * 0.5 * atom_time,
      this.position.y + (vy + this._prev_velocity.y) * 0.5 * atom_time,
      this.position.z + (vz + this._prev_velocity.z) * 0.5 * atom_time,
    );
  }
  this.world.restrict(this);
  this._prev_velocity.set(vx, vy, vz);
}
