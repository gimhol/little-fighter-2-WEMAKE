import { ArmorEnum, BotVal, BuiltIn_OID, Defines, EntityGroup, EntityVal, GK, IEntityData, OID, StateEnum } from "../../defines";
import { ensure } from "../../utils";
import { CondMaker } from "../CondMaker";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { bot_uppercut_dua } from "./bot_uppercut_dua";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";

export function make_bot_data_julian(): BotMaker {
  return new BotMaker(OID.Julian).set_actions(

    // ball
    bot_chasing_skill_action('d>a', void 0, 25, 1 / 60),

    // ball + ...a
    bot_chasing_action('d>a+a', ['a'], void 0, 0.15),

    // super-ball
    bot_ball_dfj(125, void 0),

    // explosion
    bot_explosion_duj(100, void 0, -120, 120, 100),

    // uppercut
    bot_uppercut_dua(0, void 0), {
    action_id: 'injured_dja',
    desire: Defines.desire(0.08),
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }, {
    action_id: 'shaking_dja',
    desire: Defines.desire(0.08),
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .and(EntityVal.Shaking, '>', 0)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }).set_frames([
    ...frames.standings,
    ...frames.walkings,
    ...frames.runnings
  ], [
    'shaking_dja',
    'd^a',
    'd^j',
    'd>j',
    'd>a'
  ]).set_frames([
    ...frames.punchs,
  ], [
    'd^a', 'shaking_dja'
  ]).set_states(
    [StateEnum.Attacking],
    ['shaking_dja', 'd>a+a']
  )

}

BotMaker.register(OID.Julian, make_bot_data_julian)