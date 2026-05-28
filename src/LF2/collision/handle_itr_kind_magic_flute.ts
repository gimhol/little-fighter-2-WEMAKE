import { Buff } from "../buff/Buff";
import { Buff_MagicFlute } from "../buff/Buff_MagicFlute";
import { ItrKind, SpeedMode, StateEnum } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { calc_v, is_fighter } from "../entity";
import { summary_mgr } from "../entity/SummaryMgr";
import { Collision } from "./Collision";
import { handle_rest } from "./handle_rest";

export function handle_itr_kind_magic_flute(collision: Collision): void {
  handle_rest(collision)
  const { victim, attacker, world, lf2 } = collision;
  const y = calc_v(
    victim.velocity.y,
    3,
    SpeedMode.AccTo,
    3, 1
  )
  victim.set_velocity_y(y)
  victim.toughness = 0;

  const bid = `magic_flute_from_${attacker.id}`
  let buf = world.buffs.get(bid)
  if (!buf) {
    buf = lf2.factory.create_buff(ItrKind.MagicFlute, lf2, bid)
    if (buf) {
      buf.attacker = attacker.id;
      buf.add(victim.id)
      world.buffs.set(bid, buf);
    }
  }
  if (!buf?.targets.some(v => v == victim.id))
    buf?.targets.push(victim.id);

  if (buf) buf.lifetime = 0

  switch (victim.data.type) {
    case EntityEnum.Fighter:
      if (victim.state !== StateEnum.Falling) {
        victim.enter_frame({ id: victim.data.indexes?.falling?.[-1][0] })
      }
      break;
    case EntityEnum.Weapon:
      switch (victim.state) {
        case StateEnum.Weapon_InTheSky:
        case StateEnum.HeavyWeapon_InTheSky:
          break;
        default:
          victim.team = attacker.team;
          victim.enter_frame({ id: victim.data.indexes?.in_the_skys?.[0] });
          break;
      }
  }
  victim.handle_velocity_decay(0.25);
}
