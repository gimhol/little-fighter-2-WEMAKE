import { IItrInfo } from "../defines/IItrInfo";
import { IEntityData } from "../defines/IEntityData";
import { match_all } from "../utils/string_parser/match_all";
import { match_block_once } from "../utils/string_parser/match_block";
import { match_colon_value } from "../utils/string_parser/match_colon_value";
import { to_num } from "../utils/type_cast/to_num";
import { is_non_empty_str } from "../utils/type_check";
import { cook_itr } from "./cook_itr";

export function make_itr_prefabs(full_str: string): IEntityData["itr_prefabs"] {
  const weapon_strength_str = match_block_once(
    full_str,
    "<weapon_strength_list>",
    "<weapon_strength_list_end>",
  )?.trim();
  if (!is_non_empty_str(weapon_strength_str)) return void 0;
  const list = match_all(
    weapon_strength_str,
    /entry:\s*(\d+)\s*(\S+)\s*\n?(.*)\n?/g,
  ).map(([, id, name, remain]) => {
    const entry: IItrInfo = { kind: 0, id, name };
    for (const [key, value] of match_colon_value(remain)) {
      (entry as any)[key] = to_num(value) ?? value;
    }
    cook_itr(entry);
    return entry;
  });
  if (!list.length) return void 0;
  const itr_prefab: IEntityData["itr_prefabs"] = {};
  for (const item of list) itr_prefab[item.id!] = item;
  return itr_prefab;
}
