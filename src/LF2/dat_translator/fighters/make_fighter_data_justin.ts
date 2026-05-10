import { GK, IEntityData } from "../../defines";
import { arithmetic_progression } from "../../utils";
import { bot_ball_dfa } from "../bots/bot_ball_dfa";
import { bot_chasing_action } from "../bots/bot_chasing_action";
import { bot_front_test } from "../bots/bot_front_test";
import { BotBuilder } from "./BotBuilder";
import { frames } from "../bots/frames";

export function make_fighter_data_justin(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(75, void 0, 50, 200),

    // dva
    bot_front_test('dva', [GK.d, GK.D, GK.a], 75, void 0, -10, 100),

    // d>a+a
    bot_chasing_action("d>a+a", [GK.a], 75, void 0),
    
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['dva', 'd>a']
  ).set_frames(
    frames.punchs,
    ['dva']
  ).set_frames(
    arithmetic_progression(240, 246),
    ['d>a+a']
  );
  return data;
}
