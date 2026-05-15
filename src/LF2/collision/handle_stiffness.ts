import { Collision } from "../base";


export function handle_stiffness(collision: Collision) {
  const { itr, attacker, victim } = collision;
  attacker.motionless = itr.motionless ?? attacker.itr_motionless;
  victim.shaking = itr.shaking ?? attacker.world.itr_shaking;
}
