import type { IStageInfo, IStagePhaseInfo } from "../defines";
import { arr_of, check_field } from "../ui/utils/check_field";

export function check_stage_info(info: IStageInfo, errors?: string[]): boolean {
  const my_errors: string[] = []
  check_field(info, 'stage', 'bg', 'string', my_errors)
  check_field(info, 'stage', 'id', 'string', my_errors)
  check_field(info, 'stage', 'name', 'string', my_errors)
  check_field(info, 'stage', 'phases', arr_of(), my_errors)
  // phases
  check_field(info, 'stage', 'next', ['string', 'undefined'], my_errors);
  check_field(info, 'stage', 'chapter', ['string', 'undefined'], my_errors);

  // TODO: more checking
  errors?.push(...my_errors);
  return !my_errors.length;
}

export function check_phase_info(stage: IStageInfo, info: IStagePhaseInfo, idx: number, errors: string[] = []) {
  const my_errors: string[] = []
  const name = `${stage.name}.phase[${idx}]`
  check_field(info, name, 'bound', 'number', my_errors)
  check_field(info, name, 'desc', ['string', 'undefined'], my_errors)
  return !my_errors.length;
}