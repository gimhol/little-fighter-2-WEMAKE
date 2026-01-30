import { IEntityData, ArmorEnum, Defines } from "../../defines";
/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData} 
 */
export function make_fighter_data_knigt(data: IEntityData): IEntityData {
  data.base.strength = Defines.FIGHTER_STREAGTH_STRONG
  data.base.armor = {
    hit_sounds: ["data/085.wav.mp3"],
    type: ArmorEnum.Defend,
    toughness: Defines.DEFAULT_DEFEND_VALUE_MAX,
  };
  return data;
}
