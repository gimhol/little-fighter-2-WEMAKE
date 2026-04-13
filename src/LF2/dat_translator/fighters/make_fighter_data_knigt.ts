import { ArmorEnum, Defines, IEntityData } from "../../defines";
import { BotBuilder } from "./BotBuilder";
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
    toughness: 90,
  };
  BotBuilder.make(data).set_dataset({
    w_atk_x: 90,
    j_atk_x: 90,
    d_atk_x: 200,
    r_atk_x: 150,
  })
  return data;
}
