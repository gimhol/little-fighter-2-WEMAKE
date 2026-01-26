import { IStageInfo } from "../defines";
import { preprocess_stage_phase } from "./preprocess_stage_phase";

export function preprocess_stage(v: IStageInfo): IStageInfo {
  for (let i = 0; i < v.phases.length; i++) {
    v.phases[i] = preprocess_stage_phase(v.phases[i]);
  }
  return v;
}
preprocess_stage.TAG = "preprocess_stage"