import { IBgData, IStageInfo } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { IBaseData } from "../defines/IBaseData";
import { IDatIndex } from "../defines/IDatIndex";
import { IEntityData } from "../defines/IEntityData";
import { IEntityInfo } from "../defines/IEntityInfo";
import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";
import { set_obj_field } from "../utils/container_help/set_obj_field";
import { match_block_once } from "../utils/string_parser/match_block";
import { match_colon_value } from "../utils/string_parser/match_colon_value";
import { BotBuilder } from "./fighters/BotBuilder";
import { make_ball_data } from "./make_ball_data";
import { make_ball_special } from "./make_ball_special";
import { make_bg_data } from "./make_bg_data";
import { make_entity_data } from "./make_entity_data";
import { make_entity_special } from "./make_entity_special";
import { make_character_data } from "./make_fighter_data";
import { make_fighter_special } from "./make_fighter_special";
import { cook_frames } from "./cook_frames";
import { make_frames_special } from "./make_frames_special";
import { make_stage_info_list as make_stage_infos } from "./make_stage_info_list";
import { make_weapon_data } from "./make_weapon_data";
import { make_weapon_special } from "./make_weapon_special";

export default function dat_to_json(
  full_str: string,
  datIndex?: IDatIndex | null,
): void | IStageInfo[] | IBgData | IBaseData {
  full_str = full_str.replace(/\\\\/g, "/");
  if (full_str.startsWith("<stage>")) return make_stage_infos(full_str);
  if (!datIndex) return;
  if (full_str.startsWith("name:")) return make_bg_data(full_str, datIndex);
  const infos_str = match_block_once(full_str, "<bmp_begin>", "<bmp_end>");
  if (!infos_str) {
    return;
  }

  let ret: IEntityData | undefined = void 0;
  const base: IEntityInfo = {
    name: "",
    files: {},
  };
  for (const info_str of infos_str.trim().split("\n")) {
    let reg_result;
    reg_result = info_str.match(/name:\s*(\S*)/);
    if (reg_result) {
      base.name = reg_result[1];
      continue;
    }
    reg_result = info_str.match(/head:\s*(\S*)/);
    if (reg_result) {
      base.head = reg_result[1].replace(/.bmp$/, ".png").replace(/\\/g, '/');
      continue;
    }
    reg_result = info_str.match(/small:\s*(\S*)/);
    if (reg_result) {
      base.small = reg_result[1].replace(/.bmp$/, ".png").replace(/\\/g, '/');
      continue;
    }
    if (info_str.startsWith("file(")) {
      const file_id = base.files ? Object.keys(base.files).length : 0;
      const file: ILegacyPictureInfo = {
        id: "" + file_id,
        path: "",
        row: 0,
        col: 0,
        cell_w: 0,
        cell_h: 0,
      };
      for (const [key, value] of match_colon_value(info_str)) {
        if (key.startsWith("file")) {
          file.path = value.replace(/.bmp$/, ".png").replace(/\\/g, "/");
        } else if (key === "w") {
          file.cell_w = Number(value);
        } else if (key === "h") {
          file.cell_h = Number(value);
        } else {
          (file as any)[key] = Number(value);
        }
      }
      base.files = set_obj_field(base.files, "" + file_id, file);
      continue;
    }

    reg_result = info_str.match(/(\S*)\s*:\s*([+-]?([0-9]*[.])?[0-9]+)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = Number(reg_result[2]);
      continue;
    }

    // reading field like: `name: value`;
    reg_result = info_str.match(/(\S*)\s*:\s*(\S*)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = reg_result[2];
      continue;
    }

    // reading field like: `name 10086.00`;
    reg_result = info_str.match(/(\S*)\s*([+-]?([0-9]*[.])?[0-9]+)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = Number(reg_result[2]);
      continue;
    }

    // reading field like: `name value`;
    reg_result = info_str.match(/(\S*)\s*(\S*)/);
    if (reg_result) {
      (base as any)[reg_result[1] as any] = reg_result[2];
      continue;
    }
  }

  switch ("" + datIndex.type) {
    case "0":
      ret = make_character_data(base, cook_frames(full_str, base.files));
      break;
    case "1":
      ret = make_weapon_data(base, full_str, cook_frames(full_str, base.files), datIndex);
      break;
    case "2":
      ret = make_weapon_data(base, full_str, cook_frames(full_str, base.files), datIndex);
      break;
    case "3":
      ret = make_ball_data(base, cook_frames(full_str, base.files), datIndex);
      break;
    case "4":
      ret = make_weapon_data(base, full_str, cook_frames(full_str, base.files), datIndex);
      break;
    case "5":
      ret = make_entity_data(base, cook_frames(full_str, base.files));
      break;
    case "6":
      ret = make_weapon_data(base, full_str, cook_frames(full_str, base.files), datIndex);
      break;
    default:
      console.warn(
        "[dat_to_json] unknow dat type:",
        JSON.stringify(datIndex.type),
      );
      ret = make_entity_data(base, cook_frames(full_str, base.files));
      break;
  }
  if (ret) ret.id = datIndex.id;
  if (!ret.base.name) ret.base.name = ret.type + "_" + ret.id;

  switch (ret.type) {
    case EntityEnum.Entity:
      make_entity_special(ret);
      break;
    case EntityEnum.Fighter:
      make_fighter_special(ret);
      break;
    case EntityEnum.Weapon:
      make_weapon_special(ret);
      break;
    case EntityEnum.Ball:
      make_ball_special(ret);
      break;
  }
  make_frames_special(ret);
  // float_scaling_entity(ret)
  // const r = find_float(ret, datIndex.file)
  // if (r[0]) throw new Error('float found! ' + r[1])

  BotBuilder.check_all();
  BotBuilder.builders.length = 0
  return ret;
}