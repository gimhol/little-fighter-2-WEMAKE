/**
 * Entity 恢复/续航 相关方法
 *
 * 通过 prototype 挂载到 Entity 类上。
 */
import type { Entity } from "./Entity";
import { Builtin_FrameId, type INextFrame } from "../defines";
import { clamp_add, floor, max, min, round, round_float } from "../utils";
import { turn_face } from "./face_helper";

// ============================================================
// 持有物脱手
// ============================================================

export function drop_holding(this: Entity): void {
  if (!this.holding) return;
  this.lf2.mt.mark = "dh_1";
  const w = this.holding;
  const nf =
    this.find_align_frame(
      w.frame.id,
      w.data.indexes?.on_hands,
      w.data.indexes?.in_the_skys,
    ) ?? {
      id: w.data.indexes?.in_the_skys?.[0] ?? Builtin_FrameId.Auto,
    };
  w.enter_frame(nf);
  if (w.position.y < w.ground_y) w.set_position_y(w.ground_y);
  w.bearer = null;
  this.holding = null;
}

// ============================================================
// 帧对齐查找
// ============================================================

export function find_align_frame(
  this: Entity,
  frame_id: string,
  src: string[] | undefined | null,
  dst: string[] | undefined | null,
): INextFrame {
  if (dst?.length && src?.length) {
    const src_idx = src.indexOf(frame_id);
    const dst_idx = (src_idx + 1) % dst.length;
    return { id: dst[dst_idx] };
  } else if (dst?.length) {
    return { id: dst[0] };
  } else {
    return this.find_auto_frame();
  }
}

// ============================================================
// 状态恢复
// ============================================================

export function stat_recovering(this: Entity): void {
  if (this.resting > 0) {
    this.resting = clamp_add(this.resting, -this._atom_time, 0, this.resting_max);
    return;
  }
  if (this.toughness_resting > 0) {
    this.toughness_resting = clamp_add(
      this.toughness_resting,
      -this._atom_time,
      0,
      this._toughness_resting_max,
    );
  } else if (this.toughness < this.toughness_max) {
    this.toughness = clamp_add(
      this.toughness,
      this._atom_time,
      0,
      this._toughness_max,
    );
  }
  if (
    this.fall_value < this.fall_value_max &&
    this._fall_r_tick.add(this._atom_time)
  ) {
    this.fall_value = clamp_add(
      this.fall_value,
      this._fall_r_value,
      0,
      this.fall_value_max,
    );
  }
  if (
    this.defend_value < this.defend_value_max &&
    this._defend_r_tick.add(this._atom_time)
  ) {
    this.defend_value = clamp_add(
      this.defend_value,
      this._defend_r_value,
      0,
      this.defend_value_max,
    );
  }
}

// ============================================================
// HP 恢复
// ============================================================

export function hp_recovering(this: Entity): void {
  if (this._hp <= 0 || this._hp >= this._hp_r) return;
  this._hp_r_tick.max =
    this.healing > 0
      ? this.dataset("hp_healing_ticks")
      : this.dataset("hp_r_ticks");
  if (!this._hp_r_tick.add(this._atom_time)) return;
  const value =
    this.healing > 0
      ? this.dataset("hp_healing_value")
      : this.dataset("hp_r_value");
  this.hp = min(this._hp_r, this._hp + value);
  if (this._hp === this._hp_r) this.healing = 0;
  else if (this._healing) this.healing = max(0, this._healing - value);
}

// ============================================================
// MP 恢复
// ============================================================

export function mp_recovering(this: Entity): void {
  if (
    this._hp <= 0 ||
    this._mp >= this.mp_max ||
    this._blinking_duration ||
    this._invisible_duration
  )
    return;
  this._mp_r_tick.max = this.dataset("mp_r_ticks");
  if (!this._mp_r_tick.add(this._atom_time)) return;
  const r_ratio = this.dataset("mp_r_ratio");
  const value =
    1 +
    floor(
      round_float(
        (this.hp_max - min(r_ratio * this._hp, this.hp_max)) / 100,
      ),
    );
  this.mp = min(this.mp_max, this._mp + value);
}

// ============================================================
// 合体解除检查
// ============================================================

export function check_fusion_dismissing(this: Entity): boolean {
  if (!this.fuse_bys?.length) return false;

  const { x, y, z } = this._position;
  for (const fighter of this.fuse_bys) {
    fighter.position.set(x, y, z);
  }
  if (this.dismiss_time) {
    this.dismiss_time = round_float(this.dismiss_time - this._atom_time);
  }

  const should_dismiss =
    ((this.dismiss_time !== null && this.dismiss_time <= 0) ||
      this.ctrl.sametime_keys_test("dja") ||
      this.ctrl.sequence_keys_test("ja")) &&
    y == 0;
  if (should_dismiss) this.dismiss_fusion("112");
  return should_dismiss;
}

// ============================================================
// 合体解除
// ============================================================

export function dismiss_fusion(this: Entity, frame_id: string): void {
  if (!this.fuse_bys?.length) return;
  const size = this.fuse_bys.length + 1;
  const hp = round(this.hp / size);
  const hp_r = round(this.hp_r / size);
  const mp = round(this.mp / size);
  let facing = this.facing;
  this.hp = hp;
  this.mp = mp;
  this.hp_r = hp_r;
  for (const fighter of this.fuse_bys) {
    fighter.hp = hp;
    fighter.mp = mp;
    fighter.hp_r = hp_r;
    fighter.facing = facing = turn_face(facing);
    fighter.enter_frame(
      fighter.get_next_frame({ id: frame_id })?.frame ??
        fighter.find_auto_frame(),
    );
    fighter.invisible = fighter.motionless = fighter.invulnerable = 0;
  }
  if (this.dismiss_data) this.transform(this.dismiss_data);
  this.enter_frame(
    this.get_next_frame({ id: frame_id })?.frame ?? this.find_auto_frame(),
  );
  this.dismiss_time = null;
  this.dismiss_data = null;
  this.fuse_bys = null;
}
