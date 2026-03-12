import { ICollision } from "../base/ICollision";
import { SpeedMode, StateEnum } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { calc_v, is_fighter } from "../entity";
import { Buff } from "../entity/Buff";
import { summary_mgr } from "../entity/SummaryMgr";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";

export function handle_itr_kind_magic_flute(collision: ICollision): void {
  handle_rest(collision)
  const { victim, attacker, world, rest } = collision;
  const y = calc_v(victim.velocity.y, 3, SpeedMode.AccTo, 3, 1)
  victim.set_velocity_y(y)
  victim.toughness = 0;

  const bid = `magic_flute_to_${victim.id}`
  let buf = world.buffs.get(bid)
  if (!buf) {
    const injury = 3;
    buf = new Buff(bid)
    buf.tick.max = 4;
    buf.job = () => {
      if (!is_fighter(victim)) return
      const prev_hp = victim.hp;
      victim.hp -= injury
      summary_mgr.apply_damage(attacker, injury, victim, prev_hp)
    }
    world.buffs.set(bid, buf)
  }
  buf.life.value -= rest

  switch (victim.data.type) {
    case EntityEnum.Fighter:
      if (victim.frame.state !== StateEnum.Falling) {
        victim.next_frame = { id: victim.data.indexes?.falling?.[-1][0] };
      }
      break;
    case EntityEnum.Weapon:
      switch (victim.frame.state) {
        case StateEnum.Weapon_InTheSky:
        case StateEnum.HeavyWeapon_InTheSky:
          break;
        default:
          victim.team = attacker.team;
          victim.next_frame = { id: victim.data.indexes?.in_the_skys?.[0] };
          break;
      }
  }
  victim.handle_velocity_decay(0.25);
}
