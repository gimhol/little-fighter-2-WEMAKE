import { HitFlag, IBdyInfo, IItrInfo, hit_flag_name } from "../defines";

export function set_hit_flag(info: Partial<IItrInfo>, value: HitFlag | number): Partial<IItrInfo> & Pick<IItrInfo, 'hit_flag' | 'hit_flag_name'>
export function set_hit_flag(info: Partial<IBdyInfo>, value: HitFlag | number): Partial<IBdyInfo> & Pick<IItrInfo, 'hit_flag' | 'hit_flag_name'>
export function set_hit_flag(info: Partial<IItrInfo | IBdyInfo>, value: HitFlag | number): Partial<IItrInfo | IBdyInfo> {
  return Object.assign(info, {
    hit_flag: value,
    hit_flag_name: hit_flag_name(value),
  })
}
