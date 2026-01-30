import { ArmorEnum, BotVal, BuiltIn_OID, Defines, EntityGroup, EntityVal, GK, IEntityData, StateEnum } from "../../defines";
import { ensure } from "../../utils";
import { CondMaker } from "../CondMaker";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { bot_uppercut_dua } from "./bot_uppercut_dua";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_fighter_data_julian(data: IEntityData) {
  data.base.strength = Defines.FIGHTER_STREAGTH_STRONG
  data.base.group = ensure(data.base.group, EntityGroup.Boss);
  data.base.mp_r_ratio = 2;
  data.base.ce = 3;
  data.base.armor = {
    fireproof: 1,
    antifreeze: 1,
    hit_sounds: ["data/002.wav.mp3"],
    type: ArmorEnum.Defend,
    toughness: Defines.DEFAULT_DEFEND_VALUE_MAX,
  };
  for (const k in data.frames) {
    data.frames[k].opoint?.forEach((opoint) => {
      if (opoint.oid === BuiltIn_OID.Julian) {
        opoint.hp = opoint.max_hp = 20;
        opoint.mp = opoint.max_mp = 150;
      }
    });
  }
  BotBuilder.make(data).set_actions(
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

  return data;
}
