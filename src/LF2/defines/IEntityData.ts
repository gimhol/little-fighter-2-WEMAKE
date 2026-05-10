import type { IBaseData } from "./IBaseData";
import type { IBdyPrefab } from "./IBdyPrefab";
import type { IItrPrefab } from "./IItrPrefab";
import type { IEntityInfo } from "./IEntityInfo";
import type { IFrameIndexes } from "./IFrameIndexes";
import type { IFrameInfo } from "./IFrameInfo";
import type { TNextFrame } from "./INextFrame";
import type { TEntityEnum } from "./EntityEnum";
export type TItrPrefabs = {
  [x in string]?: IItrPrefab;
}
export type TBdyPrefabs = {
  [x in string]?: IBdyPrefab;
}
export interface IEntityData extends IBaseData<IEntityInfo> {
  type: TEntityEnum;
  processed?: boolean;
  on_dead?: TNextFrame;
  on_exhaustion?: TNextFrame;
  indexes?: IFrameIndexes;
  bdy_prefabs?: TBdyPrefabs;
  itr_prefabs?: TItrPrefabs;
  frames: Record<string, IFrameInfo>;
}
