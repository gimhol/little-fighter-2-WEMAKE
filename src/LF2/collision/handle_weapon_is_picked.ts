import { ICollision } from "../base";
import { is_independent, WeaponType } from "../defines";
import { summary_mgr } from "../entity/SummaryMgr";

export function handle_weapon_is_picked(collision: ICollision): void {
  const { victim, attacker } = collision;
  if (attacker.holding) return;
  victim.holder = attacker;
  attacker.holding = victim;
  victim.team = attacker.team;
  if (victim.data.base.type === WeaponType.Heavy) {
    attacker.next_frame = { id: attacker.data.indexes?.picking_heavy };
  } else {
    attacker.next_frame = { id: attacker.data.indexes?.picking_light };
  }

  summary_mgr.get(attacker.id).picking_sum += 1
  if (!is_independent(attacker.team))
    summary_mgr.get(attacker.team).picking_sum += 1;
}
