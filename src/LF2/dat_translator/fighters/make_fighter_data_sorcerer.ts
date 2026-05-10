import { BotStateEnum, BotVal, EntityVal as E_Val, GK, IEntityData } from "../../defines";
import { bot_ball_dfa } from "../bots/bot_ball_dfa";
import { bot_ball_dfj } from "../bots/bot_ball_dfj";
import { bot_idle_action } from "../bots/bot_idle_action";
import { BotBuilder } from "./BotBuilder";
import { frames } from "../bots/frames";


export function make_fighter_data_sorcerer(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(75, void 0, 100, 10000),
    // d>j
    bot_ball_dfj(125, void 0, 100, 10000),
    // dvj
    bot_idle_action('dvj', [GK.Defend, GK.Down, GK.Jump], 350)((a, c) => {
      a.status = [BotStateEnum.Idle, BotStateEnum.Chasing, BotStateEnum.Avoiding]
      a.expression = c.and(E_Val.HpRecoverable, '>=', 50).and(BotVal.Safe, '==', 1).done()
      return a;
    }),
    // d^j
    bot_idle_action('d^j', [GK.Defend, GK.Up, GK.Jump], 350)((a, c) => {
      // todo, need ally test
      a.status = [BotStateEnum.Idle, BotStateEnum.Chasing, BotStateEnum.Avoiding]
      a.expression = c.and(E_Val.HpRecoverable, '>=', 50).and(BotVal.Safe, '==', 1).done()
      return a;
    }),
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd>j', 'd^j', 'dvj']
  );
  return data;
}
