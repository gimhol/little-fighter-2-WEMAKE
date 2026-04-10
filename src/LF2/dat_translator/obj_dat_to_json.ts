import { IEntityData } from "../defines";
import { IDatContext } from "../defines/IDatContext";
import { IDatIndex } from "../defines/IDatIndex";
import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";
import { set_obj_field } from "../utils/container_help/set_obj_field";
import { match_block_once } from "../utils/string_parser/match_block";
import { match_colon_value } from "../utils/string_parser/match_colon_value";
import { cook_frames } from "./cook_frames";
import { BotBuilder } from "./fighters/BotBuilder";
import { make_ball_data } from "./make_ball_data";
import { make_entity_data } from "./make_entity_data";
import { make_fighter_data } from "./make_fighter_data";
import { make_weapon_data } from "./make_weapon_data";
import { post_process_obj_data } from "./post_process_obj_data";

export function obj_dat_to_json(text: string, datIndex: IDatIndex): IEntityData {
  text = text.replace(/\\\\/g, "/");
  const infos_str = match_block_once(text, "<bmp_begin>", "<bmp_end>");
  if (!infos_str) throw new Error('[dat_to_json] failed, 3')
  const ctx: IDatContext = {
    index: datIndex,
    base: {
      name: "",
      files: {},
    },
    text: text,
    frames: {},
    data: void 0
  }
  for (const info_str of infos_str.trim().split("\n")) {
    let reg_result;
    reg_result = info_str.match(/name:\s*(\S*)/);
    if (reg_result) {
      ctx.base.name = reg_result[1];
      continue;
    }
    reg_result = info_str.match(/head:\s*(\S*)/);
    if (reg_result) {
      ctx.base.head = reg_result[1].replace(/.bmp$/, ".png").replace(/\\/g, '/');
      continue;
    }
    reg_result = info_str.match(/small:\s*(\S*)/);
    if (reg_result) {
      ctx.base.small = reg_result[1].replace(/.bmp$/, ".png").replace(/\\/g, '/');
      continue;
    }
    if (info_str.startsWith("file(")) {
      const file_id = ctx.base.files ? Object.keys(ctx.base.files).length : 0;
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
      ctx.base.files = set_obj_field(ctx.base.files, "" + file_id, file);
      continue;
    }

    reg_result = info_str.match(/(\S*)\s*:\s*([+-]?([0-9]*[.])?[0-9]+)/);
    if (reg_result) {
      (ctx.base as any)[reg_result[1] as any] = Number(reg_result[2]);
      continue;
    }

    // reading field like: `name: value`;
    reg_result = info_str.match(/(\S*)\s*:\s*(\S*)/);
    if (reg_result) {
      (ctx.base as any)[reg_result[1] as any] = reg_result[2];
      continue;
    }

    // reading field like: `name 10086.00`;
    reg_result = info_str.match(/(\S*)\s*([+-]?([0-9]*[.])?[0-9]+)/);
    if (reg_result) {
      (ctx.base as any)[reg_result[1] as any] = Number(reg_result[2]);
      continue;
    }

    // reading field like: `name value`;
    reg_result = info_str.match(/(\S*)\s*(\S*)/);
    if (reg_result) {
      (ctx.base as any)[reg_result[1] as any] = reg_result[2];
      continue;
    }
  }
  ctx.frames = cook_frames(ctx)
  switch (datIndex.type) {
    case "0":
      ctx.data = make_fighter_data(ctx);
      break;
    case "1":
    case "2":
    case "4":
    case "6":
      ctx.data = make_weapon_data(ctx);
      break;
    case "3":
      ctx.data = make_ball_data(ctx);
      break;
    case "5":
      ctx.data = make_entity_data(ctx);
      break;
    default:
      console.warn(
        "[dat_to_json] unknow dat type:",
        JSON.stringify(datIndex.type),
      );
      ctx.data = make_entity_data(ctx);
      break;
  }
  post_process_obj_data(ctx)
  BotBuilder.check_all();
  BotBuilder.builders.length = 0
  return ctx.data;
}
export default obj_dat_to_json;