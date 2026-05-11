import { OID, StateEnum } from "../../defines";
import { probability } from "../../utils/math/probability";
import { bot_ball_cancelling } from "./bot_ball_cancelling";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_explosion_dua } from "./bot_explosion_dua";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";


export function make_bot_data_firzen(): BotMaker {
  return new BotMaker(OID.Firzen).set_actions(
    // d^a
    bot_ball_dfj(50, void 0),

    // d^j
    bot_explosion_duj(250, void 0, -500, 500, 500),

    // ball cancell
    bot_ball_cancelling('cancel_d>j'),

    // disaster
    bot_explosion_dua(100, void 0, -700, 700, 500),

    // disaster + ...a
    bot_chasing_action('d^a+a', ['a'], void 0, probability(2, 0.1))
  ).set_states(
    [StateEnum.Attacking],
    ['cancel_d>j', 'd^a+a']
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    [bot_ball_dfj.ID, bot_explosion_dua.ID, bot_explosion_duj.ID]
  )
}

BotMaker.register(OID.Firzen, make_bot_data_firzen)