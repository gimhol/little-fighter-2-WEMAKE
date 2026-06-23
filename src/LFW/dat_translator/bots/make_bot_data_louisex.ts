import { OID } from "../../defines";
import { range } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";

export function make_bot_data_louisex(): BotMaker {
  return new BotMaker(OID.LouisEX).set_actions(
    // d>a
    bot_ball_dfa(100, void 0, 150, 400),
    // `d>a+a`
    bot_ball_continuation(`d>a+a`, 0.5, 100),
    // d^j
    bot_uppercut_dva(0, void 0, -10, 120),
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d>a', 'dva']
  ).set_frames(
    [...frames.punchs],
    ['dva']
  ).set_frames(
    range(260, 269),
    ['d>a+a']
  ).set_dataset({
    w_atk_x: 90,
    j_atk_x: 90,
    d_atk_max_x: 200,
    r_atk_x: 200,
  });
}

BotMaker.register(OID.LouisEX, make_bot_data_louisex)