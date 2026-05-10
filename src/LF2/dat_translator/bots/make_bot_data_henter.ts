import { IEntityData } from "../../defines";
import { BotBuilder } from "./BotBuilder";

export function make_bot_data_henter(data: IEntityData): IEntityData {
  BotBuilder.write_entity(data).set_dataset({
    w_atk_m_x: 79,
    w_atk_r_x: 200,
    w_atk_x: 200,
    j_atk_x: 200,
  });
  return data;
}
