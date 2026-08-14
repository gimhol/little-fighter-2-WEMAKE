import type { IStageInfo, IStagePhaseInfo } from "../defines";
import { stage_info_schema, Schema_IStagePhaseInfo } from "../defines";
import { SchemaValidator } from "../utils/schema/validate_schema";

export function check_stage_info(info: IStageInfo, errors?: string[]): boolean {
  const v = new SchemaValidator();
  const result = v.validate(info, stage_info_schema);
  if (errors) errors.push(...v.errors);
  return result;
}

export function check_phase_info(stage: IStageInfo, info: IStagePhaseInfo, idx: number, errors: string[] = []) {
  const v = new SchemaValidator();
  const result = v.validate(info, Schema_IStagePhaseInfo);
  errors.push(...v.errors);
  return result;
}