import { GK, IEntityData } from "../../defines";
import { arithmetic_progression } from "../../utils";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_fighter_data_monk(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(100, void 0, 0, 400),
    // d>a+d>a
    bot_ball_dfa(100, 0.5, 0, 400)(a => {
      a.keys = [GK.Defend, 'F', GK.Attack]
      return a
    }),
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ["d>a"]
  ).set_frames(
    frames.punchs,
    ["d>a"]
  ).set_frames(
    arithmetic_progression(240, 248),
    ["d>a+d>a"]
  );
  return data;
}
