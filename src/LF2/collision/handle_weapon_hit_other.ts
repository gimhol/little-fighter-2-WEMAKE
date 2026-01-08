import { ICollision } from "../base";
import { StateEnum } from "../defines";
import { round } from "../utils";

export function handle_weapon_hit_other(collision: ICollision): void {
  const { attacker } = collision;
  if (attacker.frame.state === StateEnum.Weapon_OnHand) {
    return;
  }
  if (attacker.frame.state === StateEnum.Weapon_Throwing) {
    // TODO: 这里是击中的反弹，如何更合适？ -Gim
    attacker.set_velocity(
      -0.3 * attacker.velocity.x,
      round(0.3 * attacker.velocity.y),
      0
    )
  }

  const nf = attacker.find_align_frame(
    attacker.frame.id,
    attacker.data.indexes?.throwings,
    attacker.data.indexes?.in_the_skys
  )
  attacker.next_frame = nf
}
