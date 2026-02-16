import { ICollision } from "../base";

export function handle_super_punch_me(collision: ICollision): void {
  const { victim } = collision;
  victim.add_v_rest(collision);
}
