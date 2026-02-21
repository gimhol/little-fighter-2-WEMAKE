import { EntityEnum } from "../defines/EntityEnum";
import { IDatContext } from "../defines/IDatContext";
import { IEntityData } from "../defines/IEntityData";

export function make_entity_data(ctx: IDatContext): IEntityData {
  const { base: info, frames, index: datIndex } = ctx
  const ret: IEntityData = {
    id: datIndex.id,
    type: EntityEnum.Entity,
    base: info,
    frames: frames,
  };
  return ret;
}
