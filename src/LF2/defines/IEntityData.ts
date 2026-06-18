import type { IBaseData } from "./IBaseData";
import type { IBdyInfo } from "./IBdyInfo";
import type { IItrInfo } from "./IItrInfo";
import type { IEntityInfo } from "./IEntityInfo";
import type { IFrameIndexes } from "./IFrameIndexes";
import type { IFrameInfo } from "./IFrameInfo";
import type { TNextFrame } from "./INextFrame";
import type { TEntityEnum } from "./EntityEnum";
export type TItrPrefabs = {
  [x in string]?: IItrInfo;
}
export type TBdyPrefabs = {
  [x in string]?: IBdyInfo;
}
export interface IEntityData extends IBaseData<IEntityInfo> {
  type: TEntityEnum;
  on_dead?: TNextFrame;
  on_exhaustion?: TNextFrame;
  indexes?: IFrameIndexes;
  bdy_prefabs?: TBdyPrefabs;
  itr_prefabs?: TItrPrefabs;
  frames: Record<string, IFrameInfo>;
  
  /**
   * 数据是否已处理
   *
   * 存在processed为false时 
   * 
   * 加载后时会对数据进行额外处理
   * 见函数 preprocess_entity_data
   * 
   * @type {?boolean} 默认值: true
   */
  processed?: boolean;
}
