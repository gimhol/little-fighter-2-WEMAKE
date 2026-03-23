import { DatTypeEnum, BuiltIn_OID as OID } from "../defines";
import type { ITempDataLists } from "../defines/IDataLists";
import type { ITempDatIndex } from "../defines/IDatIndex";
import { match_block_once } from "../utils/string_parser/match_block";
import { match_colon_value } from "../utils/string_parser/match_colon_value";
import { match_hash_end } from "../utils/string_parser/match_hash_end";

export function parase_indexes(
  text: string | undefined | null,
  suffix: 'json5' | 'json'
): ITempDataLists {
  if (!text)
    throw new Error('[read_indexes] failed, text got empty!')
  if (text.indexOf('[NOT_READY]') >= 0)
    throw new Error(`[read_indexes] failed, '[NOT_READY]' mark still exists.`)

  const objects = match_block_once(text, "<object>", "<object_end>")
    ?.split(/\n|\r/)
    .filter((v) => v)
    .map<ITempDatIndex>((line) => {
      const item: ITempDatIndex = { id: "", type: DatTypeEnum.Invalid, file: "", src: "" };
      for (const [name, value] of match_colon_value(line)) {
        switch (name) {
          case "id":
          case "alias":
          case "skipped":
            item[name] = value;
            break;
          case "type":
            if (value in DatTypeEnum) item[name] = value as DatTypeEnum;
            break;
          case "groups":
            item[name] = value.split(',');
            break;
          case "file":
            item.src = value.replace(/\\/g, "/");
            item[name] = value.replace(/\\/g, "/").replace(/.dat$/, `.obj.${suffix}`);
            break;
        }
      }
      if (item.alias && item.id) {
        const tmp = item.id;
        item.id = item.alias;
        item.alias = tmp;
      }
      const hash = match_hash_end(line);
      if (hash) item.hash = hash;
      if (item.id === OID.Weapon_LouisArmourA) item.hash = "louis_limbs_armour";
      if (item.id === OID.Weapon_Boomerang) item.hash = "boomerang";
      if (item.id === OID.HenryArrow1) item.hash = "henry_arrow";
      if (item.id === OID.RudolfWeapon) item.hash = "rudolf_weapon";
      return item;
    }) || [];

  const backgrounds = match_block_once(text, "<background>", "<background_end>")
    ?.split(/\n|\r/)
    .filter((v) => v)
    .map<ITempDatIndex>((line) => {
      const item: ITempDatIndex = { id: "", type: DatTypeEnum.Background, file: "", src: "" };
      for (const [name, value] of match_colon_value(line)) {
        switch (name) {
          case "id":
            item[name] = "bg_" + value;
            break;
          case "alias":
          case "skipped":
            item[name] = value;
            break;
          case "file":
            item.src = value.replace(/\\/g, "/");
            item[name] = value.replace(/\\/g, "/").replace(/.dat$/, `.bg.${suffix}`);
            break;
        }
      }
      return item;
    }) || [];

  const stages = match_block_once(text, "<stage>", "<stage_end>")
    ?.split(/\n|\r/)
    .filter((v) => v)
    .map<ITempDatIndex>((line) => {
      const item: ITempDatIndex = { id: "", type: DatTypeEnum.Stage, file: "", src: "" };
      for (const [name, value] of match_colon_value(line)) {
        switch (name) {
          case "id":
          case "alias":
          case "skipped":
            item[name] = value;
            break;
          case "file": {
            item.src = value.replace(/\\/g, "/")
            const temp = value.replace(/\\/g, "/")
            if (value.endsWith('.dat'))
              item[name] = temp.replace(/.dat$/, `.stage.${suffix}`);
            else if (value.endsWith('.txt'))
              item[name] = temp.replace(/.txt$/, `.stage.${suffix}`);
            else
              throw new Error('file suffix not supported, must be ".dat" or ".txt"')
            break;
          }
        }
      }
      return item;
    }) || [];


  return {
    objects,
    backgrounds,
    stages,
    bots: []
  };
}
