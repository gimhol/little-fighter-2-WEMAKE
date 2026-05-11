import { Defines, IEntityData } from "../../defines";

export function make_fighter_data_deep(data: IEntityData) {
  data.base.strength = Defines.FIGHTER_STREAGTH_STRONG
  return data;
}
