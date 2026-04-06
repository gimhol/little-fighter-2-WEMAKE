import { ICollision } from "../base/ICollision";
import { EntityEnum, StateEnum } from "../defines";
import { round } from "../utils/math/base";

export function handle_itr_kind_whirlwind(c: ICollision) {
  const { attacker, victim } = c;
  let { x, y, z } = victim.velocity;
  const dz = round(victim.position.z - attacker.position.z);
  const dx = round(victim.position.x - attacker.position.x);
  let d = dx > 0 ? -1 : dx < 0 ? 1 : 0;
  let l = dz > 0 ? -1 : dz < 0 ? 1 : 0;
  const max_vy = attacker.dataset('whirlwind_vy_max'); // 4
  const acc_y = attacker.dataset('whirlwind_acc_y'); // 1
  const acc_x = attacker.dataset('whirlwind_acc_x'); // 0.5
  const acc_z = attacker.dataset('whirlwind_acc_z'); // 0.5
  y += y < max_vy ? acc_y : 0;
  x += d * acc_x;
  z += l * acc_z;
  victim.set_velocity(x, y, z);
  switch (victim.type) {
    case EntityEnum.Weapon:
      switch (victim.frame.state) {
        case StateEnum.Weapon_InTheSky:
        case StateEnum.HeavyWeapon_InTheSky:
          break;
        default:
          victim.next_frame = { id: victim.data.indexes?.in_the_skys?.[0] };
          break;
      }
      break;
  }
}
