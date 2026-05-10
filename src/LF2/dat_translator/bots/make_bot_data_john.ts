import { BotStateEnum, BotVal, EntityVal as E_Val, GK, IEntityData, OID, StateEnum } from "../../defines";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_idle_action } from "./bot_idle_action";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";


export function make_bot_data_john(): BotMaker {
  return new BotMaker(OID.John).set_actions(
    // d>a
    bot_ball_dfa(75, void 0, 100, 10000),
    // d>j
    bot_ball_dfj(100, void 0, 100, 10000),
    // d^a
    bot_chasing_action('d^a', [GK.Defend, GK.Up, GK.Attack], 250),
    // dvj
    bot_idle_action('dvj', [GK.Defend, GK.Down, GK.Jump], 350)((a, c) => {
      a.status = [BotStateEnum.Idle, BotStateEnum.Chasing, BotStateEnum.Avoiding]
      a.expression = c.and(E_Val.HpRecoverable, '>=', 100)
        .and(BotVal.Safe, '==', 1)
        .done()
      return a;
    }),
    // d^j
    bot_idle_action('d^j', [GK.Defend, GK.Up, GK.Jump], 350)((a, c) => {
      // todo, need ally test
      a.status = [BotStateEnum.Idle, BotStateEnum.Chasing, BotStateEnum.Avoiding]
      a.expression = c
        .and(E_Val.HpRecoverable, '>=', 100)
        .and(BotVal.Safe, '==', 1).done()
      return a;
    }),

    //s_punch+j
    bot_chasing_action('s_punch+j', [GK.Jump])((a, c) => {
      a.expression = c.and(BotVal.EnemyState, '==', StateEnum.Falling).done()
      return a;
    }),
    //s_punch+d>a
    bot_chasing_action('s_punch+d>a', [GK.Defend, 'F', GK.Attack], 100)((a, c) => {
      a.expression = c.and(BotVal.EnemyState, '==', StateEnum.Falling).done()
      return a;
    }),
    //s_punch+d>j
    bot_chasing_action('s_punch+d>j', [GK.Defend, 'F', GK.Jump], 100)((a, c) => {
      a.expression = c.and(BotVal.EnemyState, '==', StateEnum.BrokenDefend).done()
      return a;
    })
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd>j', 'd^a', 'd^j', 'dvj']
  ).set_frames(
    frames.super_punch,
    ['s_punch+j', 's_punch+d>a', 's_punch+d>j']
  );
}

BotMaker.register(OID.John, make_bot_data_john)