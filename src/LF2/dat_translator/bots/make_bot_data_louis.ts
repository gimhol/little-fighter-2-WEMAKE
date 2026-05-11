import { EntityVal, OID } from "../../defines";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_uppercut_duj } from "./bot_uppercut_duj";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";

export function make_bot_data_louis(): BotMaker {
  return new BotMaker(OID.Louis).set_actions(
    // d>a
    bot_ball_dfa(150, void 0, 120, 800),
    // d>j
    bot_ball_dfj(50, void 0, 120, 250),
    // d^j
    bot_uppercut_duj(100, void 0, -10, 120),
    // dja
    bot_chasing_skill_action('dja', void 0, void 0, 0.01)((e, c) => {
      e.expression = c?.and(EntityVal.HP_P, '<', 33).done()
      return e;
    })
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d^j', 'd>a', 'd>j', 'dja']
  ).set_frames(
    [
      ...frames.punchs,
    ],
    ['d^j']
  )
}

BotMaker.register(OID.Louis, make_bot_data_louis)

