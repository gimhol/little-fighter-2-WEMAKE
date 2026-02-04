import { IEntityData, ArmorEnum, Defines } from "../../defines";
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
    toughness: Defines.DEFAULT_DEFEND_VALUE_MAX,
  };
  BotBuilder.make(data).set_dataset({
    w_atk_f_x: 90,
    w_atk_b_x: 90,
    j_atk_f_x: 90,
    j_atk_b_x: 90,
    d_atk_f_x: 200,
    r_atk_f_x: 150,
  })
  return data;
}
