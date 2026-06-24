import { any, fields, str } from "../fields";
import type { IBaseData } from "./IBaseData";
import { bg_info_new, type IBgInfo } from "./IBgInfo";
import type { IBgLayerInfo } from "./IBgLayerInfo";
import type { IWorldDataset } from "./IWorldDataset";

export interface IBgData extends IBaseData<IBgInfo> {
  type: "background";
  dataset?: Partial<IWorldDataset>;
  layers: IBgLayerInfo[];
}

export const bg_data_info_fields = fields<IBgData>({
  id: str("ID"),
  alias_id: str("别名ID"),
  type: str("类型"),
  base: any,
  dataset: any,
  layers: any,
});

export function bg_data_new(): IBgData {
  return {
    type: "background",
    id: "",
    base: bg_info_new(),
    layers: [],
  };
}