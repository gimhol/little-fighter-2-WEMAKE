import { ICollision } from "../base/ICollision";
import { EntityEnum, StateEnum } from "../defines";
import { round } from "../utils/math/base";

export function handle_itr_kind_whirlwind(c: ICollision) {
  const { attacker, victim } = c;
  let { x, y, z } = victim.velocity;
  const dz = round(victim.position.z - attacker.position.z);
  const dx = round(victim.position.x - attacker.position.x);
  let d = dx > 0 ? -1 : 1;
  let l = dz > 0 ? -1 : dz < 0 ? 1 : 0;
  y += y < 4 ? 1 : -1;
  x += d * 0.5;
  z += l * 0.5;
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
