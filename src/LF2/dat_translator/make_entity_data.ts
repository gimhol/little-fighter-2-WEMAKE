import { EntityEnum } from "../defines/EntityEnum";
import { IDatContext } from "../defines/IDatContext";
import { IEntityData } from "../defines/IEntityData";
import { make_entity_special } from "./make_entity_special";

export function make_entity_data(ctx: IDatContext): IEntityData {
  const { base: info, frames, index: datIndex } = ctx
  info.name = datIndex.hash ?? datIndex.file.replace(/[^a-z|A-Z|0-9|_]/g, "");
  const ret: IEntityData = {
    id: datIndex.id,
    type: EntityEnum.Entity,
    base: info,
    frames: frames,
  };
  make_entity_special(ret);
  return ret;
}
