import { IBaseSelectProps } from "../../Component/Select";
import { HitFlag, hit_flag_desc_map, ItrEffect, ItrEffectDescriptions, ItrKind, ItrKindDescriptions as ItrKindDescriptions, StateEnum } from "@/LF2/defines";
import { BdyKind, BdyKindDescriptions } from "@/LF2/defines/BdyKind";
import { EntityEnum } from "@/LF2/defines/EntityEnum";
import { SpeedMode } from "@/LF2/defines/SpeedMode";
import './style.scss';
function make_num_enum_select_props<T extends number = number>(enum_obj: any, value_title_map?: any): IBaseSelectProps<string, T> {
  return ({
    items: Object.keys(enum_obj).filter(key => {
      if (key.startsWith('_')) return false;
      if (!Number.isNaN(Number(key))) return false;
      return true;
    }),
    parse: (k: string) => {
      const value = (enum_obj as any)[k];
      const label = `${k}(${value})`;
      if (!value_title_map) return [value, label];
      return [value, label, { title: value_title_map[value] }];
    }
  });
}
const make_str_enum_select_props = (enum_obj: any, value_desc_map?: any): IBaseSelectProps<string, string> => ({
  items: Object.keys(enum_obj).filter(key => {
    if (key.startsWith('_')) return false;
    return true;
  }),
  parse: (k: string) => {
    const value = (enum_obj as any)[k];
    const label = `${k}(${value})`;
    if (!value_desc_map) return [value, label]
    return [value, label, { title: value_desc_map[value] }]
  }
})
export const STATE_SELECT_PROPS = make_num_enum_select_props(StateEnum);
export const SPEED_MODE_SELECT_PROPS = make_num_enum_select_props(SpeedMode);
export const ITR_KIND_SELECT_PROPS = make_num_enum_select_props(ItrKind, ItrKindDescriptions);
export const ITR_EFFECT_SELECT_PROPS = make_num_enum_select_props(ItrEffect, ItrEffectDescriptions);
export const BDY_KIND_SELECT_PROPS = make_num_enum_select_props(BdyKind, BdyKindDescriptions);
export const ENTITY_TYPE_SELECT_PROPS = make_str_enum_select_props(EntityEnum);