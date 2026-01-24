import { GameKey as GK, IValGetter, IValGetterGetter } from "../defines";
import { S_Val } from "../defines/StageVal";
import { Stage } from "../stage";
import { get_val_from_world } from "./get_val_from_world";

export const stage_world_val_getters = new Map<string, undefined | IValGetter<Stage>>();
export const stage_val_getters: Record<S_Val, IValGetter<Stage>> = {
  [S_Val.EnemiesCleared]: (e) => e.all_fighter_dead() ? 1 : 0,
  [S_Val.DialogCleared]: (e) => e.dialog_cleared() ? 1 : 0,
  [S_Val.CurPhaseTime]: (e) => e.phase_time,
  [S_Val.CurDialogTime]: (e) => e.dialog_time,
  [S_Val.PressAttack]: (e) => e.lf2.events.some(v => v.game_key === GK.a && v.pressed) ? 1 : 0,
  [S_Val.PressJump]: (e) => e.lf2.events.some(v => v.game_key === GK.j && v.pressed) ? 1 : 0,
  [S_Val.PressDefend]: (e) => e.lf2.events.some(v => v.game_key === GK.d && v.pressed) ? 1 : 0,
  [S_Val.PressUp]: (e) => e.lf2.events.some(v => v.game_key === GK.U && v.pressed) ? 1 : 0,
  [S_Val.PressDown]: (e) => e.lf2.events.some(v => v.game_key === GK.D && v.pressed) ? 1 : 0,
  [S_Val.PressLeft]: (e) => e.lf2.events.some(v => v.game_key === GK.L && v.pressed) ? 1 : 0,
  [S_Val.PressRight]: (e) => e.lf2.events.some(v => v.game_key === GK.R && v.pressed) ? 1 : 0,
}

export const get_val_getter_from_stage: IValGetterGetter<Stage> = (word: string): IValGetter<Stage> | undefined => {
  const val_getter = stage_val_getters[word as S_Val];
  if (val_getter) return val_getter;

  const world_val_getter = get_val_from_world(word);
  if (!world_val_getter) {
    stage_world_val_getters.set(word, world_val_getter);
    return void 0;
  }
  const fallback: IValGetter<Stage> = (e, ...arg) => world_val_getter(e.world, ...arg);
  stage_world_val_getters.set(word, fallback);
  return fallback;
};
