import { EntityGroup, IEntityData } from "../../defines";
import { ensure } from "../../utils";

export function make_fighter_data_bat(data: IEntityData) {
  data.base.group = ensure(data.base.group, EntityGroup.Boss);
  return data;
}
