import { ICollision } from "../base";
import { StateEnum, W_T } from "../defines";

export function handle_weapon_hit_other(collision: ICollision): void {
  const { attacker } = collision;
  if (attacker.frame.state === StateEnum.Weapon_OnHand) {
    return;
  }
  const is_base_ball =
    attacker.data.base.type === W_T.Baseball ||
    attacker.data.base.type === W_T.Drink;


  if (attacker.frame.state === StateEnum.Weapon_Throwing) {
    // TODO: 这里是击中的反弹，如何更合适？ -Gim
    if (is_base_ball) {
      const vx = 0;
      const vy = 5;
      attacker.set_velocity(vx, vy, 0)
    } else {
      const vx = -0.3 * attacker.velocity.x;
      const vy = 0.3 * attacker.velocity.y;
      attacker.set_velocity(vx, vy, 0)
    }
  }

  const nf = attacker.find_align_frame(
    attacker.frame.id,
    attacker.data.indexes?.throwings,
    attacker.data.indexes?.in_the_skys
  )
  attacker.next_frame = nf
}
