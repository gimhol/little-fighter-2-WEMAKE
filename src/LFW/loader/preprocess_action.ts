import { Expression } from "../base/Expression";
import type { TAction } from "../defines";
import { ActionType } from "../defines/actions/ActionType";
import type { LFW } from "../LFW";
import { is_non_blank_str } from "../utils";
import { get_val_geter_from_collision } from "./get_val_from_collision";
import { preprocess_next_frame } from "./preprocess_next_frame";

export function preprocess_action(lfw: LFW, action: TAction, jobs: Promise<void>[]): TAction {
  action.tester = action.test ? new Expression(
    action.test, get_val_geter_from_collision
  ) : void 0
  action.type = action.type.toUpperCase() as ActionType;
  switch (action.type) {
    case ActionType.A_SOUND:
    case ActionType.V_SOUND:
      for (const sound of action.data.path) {
        if (is_non_blank_str(sound) && !lfw.sounds.has(sound))
          jobs.push(lfw.sounds.load(sound, sound));
      }
      break;
    case ActionType.A_NEXT_FRAME:
    case ActionType.V_NEXT_FRAME:
    case ActionType.A_DEFEND:
    case ActionType.V_DEFEND:
    case ActionType.A_BROKEN_DEFEND:
    case ActionType.V_BROKEN_DEFEND:
      preprocess_next_frame(action.data);
      break;
  }
  return action;
}
preprocess_action.TAG = "preprocess_action";