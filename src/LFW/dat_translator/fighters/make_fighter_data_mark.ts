import { Defines, type IEntityData } from "../../defines";

export function make_fighter_data_mark(data: IEntityData) {
  data.base.strength = Defines.FIGHTER_STREAGTH_STRONG
  return data;
}



