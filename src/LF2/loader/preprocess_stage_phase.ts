import { Expression } from "../base";
import { IStagePhaseInfo } from "../defines";
import { get_val_getter_from_stage } from "./get_val_getter_from_stage";

export function preprocess_stage_phase(v: IStagePhaseInfo): IStagePhaseInfo {
  if(typeof v.end_test === 'string') v.end_tester = new Expression(v.end_test, get_val_getter_from_stage)
  return v;
}
preprocess_stage_phase.TAG = 'preprocess_stage_phase'