import { Defines, EntityGroup, IEntityData } from "../../defines";
import { ensure } from "../../utils";

/**
 * @param data 
 * @returns 
 */
export function make_figther_data_louisex(data: IEntityData): IEntityData {
  data.base.strength = Defines.FIGHTER_STREAGTH_STRONG
  data.base.group = ensure(data.base.group, EntityGroup.Boss);
  return data;
}
