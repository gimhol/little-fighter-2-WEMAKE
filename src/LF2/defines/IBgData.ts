import type { IWorldDataset } from "../IWorldDataset";
import type { IBaseData } from "./IBaseData";
import { bg_info_new, type IBgInfo } from "./IBgInfo";
import type { IBgLayerInfo } from "./IBgLayerInfo";
import { make_field_orders } from "./make_field_orders";

export interface IBgData extends IBaseData<IBgInfo> {
  type: "background";
  dataset?: Partial<IWorldDataset>;
  layers: IBgLayerInfo[];
}

export const bg_data_field_orders = make_field_orders<IBgData>({
  id: 0,
  alias_id: 0,
  type: 0,
  base: 0,
  dataset: 0,
  layers: 0,
});

export function bg_data_new(): IBgData {
  return {
    type: "background",
    id: "",
    base: bg_info_new(),
    layers: [],
  };
}