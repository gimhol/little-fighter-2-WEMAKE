import { Expression } from "../base";
import { IStagePhaseInfo } from "../defines";
import { get_val_getter_from_stage } from "./get_val_getter_from_stage";

export function preprocess_stage_phase(v: IStagePhaseInfo): IStagePhaseInfo {

  v.end_testers = v.end_test?.map(v => new Expression(v, get_val_getter_from_stage))
  if (v.dialogs)
    for (const d of v.dialogs)
      d.end_testers = d.end_test?.map(v => new Expression(v, get_val_getter_from_stage))

  return v;
}
preprocess_stage_phase.TAG = 'preprocess_stage_phase'