import { ICollision } from "../base/ICollision";
import { Defines as D, StateEnum as SE } from "../defines";
import { is_fighter } from "../entity/type_check";

export function is_fall(collision: ICollision) {
  const { victim } = collision;
  return (
    !is_fighter(victim) ||
    victim.fall_value <= 0 ||
    victim.hp <= 0 ||
    victim.state === SE.Frozen ||
    (victim.fall_value < D.DEFAULT_FALL_VALUE_DIZZY && SE.Caught === victim.state) ||
    (victim.fall_value <= D.DEFAULT_FALL_VALUE_DIZZY && victim.position.y > victim.ground_y)
  );
}
