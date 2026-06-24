import type { IStageInfo, IStagePhaseInfo } from "../defines";
import { Schema_IStageInfo, Schema_IStagePhaseInfo } from "../defines";
import { SchemaValidator } from "../utils/schema/validate_schema";

export function check_stage_info(info: IStageInfo, errors?: string[]): boolean {
  const v = new SchemaValidator();
  const result = v.validate(info, Schema_IStageInfo);
  if (errors) errors.push(...v.errors);
  return result;
}

export function check_phase_info(stage: IStageInfo, info: IStagePhaseInfo, idx: number, errors: string[] = []) {
  const v = new SchemaValidator();
  const result = v.validate(info, Schema_IStagePhaseInfo);
  errors.push(...v.errors);
  return result;
}