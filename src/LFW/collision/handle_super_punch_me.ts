import type { Collision } from "../collision/Collision";

export function handle_super_punch_me(collision: Collision): void {
  const { victim } = collision;
  victim.add_v_rest(collision);
}
