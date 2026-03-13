import type { ICollision } from "../base/ICollision";
import type { TFace } from "../defines";
import { ItrEffect as IE } from "../defines/ItrEffect";
import { is_fall } from "./is_fall";

export function calc_itr_velocity(collision: ICollision): [number, number, number, TFace] {
  const { itr, attacker, victim } = collision;
  const { dvx = 0, dvy = attacker.dataset('ivy_d'), dvz = 0 } = itr;
  const diff_x = victim.position.x - attacker.position.x;
  const weight_x = victim.data.base.weight || 1;
  const weight_y = victim.data.base.weight || 1;
  const weight_z = victim.data.base.weight || 1;

  const explosion = (
    itr.effect == IE.FireExplosion ||
    itr.effect == IE.Explosion
  );
  let x_direction: TFace = -1;
  if (!explosion) x_direction = attacker.facing;
  else if (diff_x > 0) x_direction = -1;
  else if (diff_x < 0) x_direction = 1;

  return [
    dvx * attacker.dataset('ivx_f') * x_direction / weight_x,
    (is_fall(collision) ? dvy * attacker.dataset('ivy_f') : 0) / weight_y,
    dvz * attacker.dataset('ivz_f') / weight_z,
    x_direction,
  ];
}
