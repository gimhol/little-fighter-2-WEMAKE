import { Collision } from "../base";

export function handle_healing(collision: Collision): void {
  const { itr, victim } = collision;
  if (itr.injury) victim.healing = itr.injury;
}
