import { ICollision } from "../base/ICollision";
import { StateEnum } from "../defines";
import { is_ball, is_weapon } from "../entity";
import { round } from "../utils/math/base";
import { normalize } from "../utils/math/normalize";

export function handle_itr_kind_whirlwind(c: ICollision) {
  const { attacker, victim, world } = c;
  if (is_ball(victim)) return;

  let { x: vx, y: vy, z: vz } = victim.velocity;
  const dz = round(attacker.position.z - victim.position.z);
  const dx = round(attacker.position.x - victim.position.x);
  const x_direction = normalize(dx);
  const z_direction = normalize(dz);
  const max_vy = attacker.dataset('whirlwind_vy_max');
  const acc_y = attacker.dataset('whirlwind_acc_y') / world.atom_time;
  const acc_x = attacker.dataset('whirlwind_acc_x') / world.atom_time;
  const acc_z = attacker.dataset('whirlwind_acc_z') / world.atom_time;

  if (vy < max_vy) vy += acc_y;
  vx += x_direction * acc_x;
  vz += z_direction * acc_z;
  victim.set_velocity(vx, vy, vz);

  if (!is_weapon(victim)) return;

  switch (victim.state) {
    case StateEnum.Weapon_OnHand:
    case StateEnum.HeavyWeapon_OnHand:
    case StateEnum.HeavyWeapon_InTheSky:
    case StateEnum.Weapon_InTheSky:
      break;
    default:
      victim.next_frame = { id: victim.data.indexes?.in_the_skys?.[0] };
      break;
  }

}
