import { Defines, IEntityData } from "../../defines";
import { bot_explosion_dua } from "../bots/bot_explosion_dua";
import { bot_explosion_duj } from "../bots/bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "../bots/frames";

export function make_fighter_data_jan(data: IEntityData) {
  data.base.strength = Defines.FIGHTER_STREAGTH_WEAK
  if (data.base.files) {
    data.base.files['0'].variants = ['2']
    data.base.files['1'].variants = ['3']
  }
  BotBuilder.make(data).set_actions(
    // d^a
    bot_explosion_dua(150, void 0, 50, 400, 160000),

    // d^j
    bot_explosion_duj(200, void 0, 0, 10000)((a, c) => {
      return a
    }),

  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d^a', 'd^j']
  );
  return data;
}
