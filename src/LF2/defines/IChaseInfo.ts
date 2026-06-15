import { ChaseLost } from "./ChaseLost";
import { ChaseStratedy } from "./ChaseStratedy";
import { HitFlag } from "./HitFlag";
import { fields, int } from "../fields";

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

export function chase_info_new(): IChaseInfo {
  return {
    flag: 0,
    lost: 0
  };
}

export const chase_Info_fields = fields<Partial<IChaseInfo>>({
  stratedy: int("切换跟踪对象的策略"),
  flag: int("跟踪对象的标志"),
  lost: int("跟踪对象丢失后的行为"),
  oy: int("Y 轴偏移"),
});
