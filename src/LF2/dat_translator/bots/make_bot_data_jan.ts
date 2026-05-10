import { Defines, IEntityData } from "../../defines";
import { bot_explosion_dua } from "./bot_explosion_dua";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_bot_data_jan(data: IEntityData) {
  BotBuilder.write_entity(data).set_actions(
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
