import type { Collision } from "../collision/Collision";


export function handle_stiffness(collision: Collision) {
  const { itr, attacker, victim } = collision;
  attacker.motionless = itr.motionless ?? attacker.itr_motionless;
  victim.shaking = itr.shaking ?? attacker.world.dataset.itr_shaking;
}
