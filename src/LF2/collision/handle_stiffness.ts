import { ICollision } from "../base";


export function handle_stiffness(collision: ICollision) {
  const { itr, attacker, victim } = collision;
  attacker.motionless = itr.motionless ?? collision.victim.itr_motionless;
  victim.shaking = itr.shaking ?? collision.attacker.world.itr_shaking;
}
