import type { IWorldDataset } from "../IWorldDataset";
import type { IBaseData } from "./IBaseData";
import type { IBgInfo } from "./IBgInfo";
import type { IBgLayerInfo } from "./IBgLayerInfo";

export interface IBgData extends IBaseData<IBgInfo> {
  type: "background";
  dataset?: Partial<IWorldDataset>;
  layers: IBgLayerInfo[];
}
