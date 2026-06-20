import { Expression } from "../base/Expression";
import type { TAction } from "../defines";
import { ActionType } from "../defines/ActionType";
import type { LFW } from "../LFW";
import { is_non_blank_str } from "../utils";
import { get_val_geter_from_collision } from "./get_val_from_collision";
import { preprocess_next_frame } from "./preprocess_next_frame";

export function preprocess_action(lfw: LFW, action: TAction, jobs: Promise<void>[]): TAction {
  action.tester = action.test ? new Expression(
    action.test, get_val_geter_from_collision
  ) : void 0
  switch (action.type) {
    case ActionType.A_Sound:
    case ActionType.V_Sound:
      for (const sound of action.data.path) {
        if (is_non_blank_str(sound) && !lfw.sounds.has(sound))
          jobs.push(lfw.sounds.load(sound, sound));
      }
      break;
    case ActionType.A_NextFrame:
    case ActionType.V_NextFrame:
    case ActionType.A_Defend:
    case ActionType.V_Defend:
    case ActionType.A_BrokenDefend:
    case ActionType.V_BrokenDefend:
      preprocess_next_frame(action.data);
      break;
  }
  return action;
}
preprocess_action.TAG = "preprocess_action";