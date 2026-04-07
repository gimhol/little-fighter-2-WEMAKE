import { ICollision } from "../base";


export function handle_stiffness(collision: ICollision) {
  const { itr, attacker, victim } = collision;
  attacker.motionless = itr.motionless ?? attacker.itr_motionless;
  victim.shaking = itr.shaking ?? attacker.world.itr_shaking;
}
