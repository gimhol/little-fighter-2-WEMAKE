import { ChaseLost } from "./ChaseLost";
import { ChaseStratedy } from "./ChaseStratedy";
import { HitFlag } from "./HitFlag";


export interface IChaseInfo {
  /**
   * 切换跟踪对象的策略
   */
  stratedy?: number | ChaseStratedy;

  /**
   * 跟踪对象的标志
   */
  flag: number | HitFlag;

  /**
   * 跟踪对象丢失后的行为
   */
  lost: number | ChaseLost;

  oy?: number;
}
