import { EntityGroup, type IEntityData } from "../../defines";
import { ensure } from "../../utils";

export function make_fighter_data_henter(data: IEntityData): IEntityData {
  data.base.group = ensure(data.base.group, EntityGroup._3000);
  // NOTE: 很奇怪hunter 的frame3有个opoint
  data.frames[3].opoint = void 0;
  return data;
}
