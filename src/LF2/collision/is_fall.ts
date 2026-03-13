import { ICollision } from "..";
import { StateEnum, Defines } from "../defines";

export function is_fall(collision: ICollision) {
  const { victim } = collision;
  return (
    victim.fall_value <= 0 ||
    victim.hp <= 0 ||
    victim.frame.state === StateEnum.Frozen ||
    (victim.fall_value < Defines.DEFAULT_FALL_VALUE_DIZZY && StateEnum.Caught === victim.frame.state) ||
    (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY && victim.position.y > victim.ground_y)
  );
}
