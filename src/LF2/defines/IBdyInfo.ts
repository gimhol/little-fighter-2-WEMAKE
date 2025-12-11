import type { TAction } from "./TAction";
import { BdyKind } from "./BdyKind";
import { HitFlag } from "./HitFlag";
import type { IExpression } from "./IExpression";
import type { IQube } from "./IQube";
import type { IQubePair } from "./IQubePair";

export interface IBdyInfo extends IQube {
  /**
   * 预制信息id
   *
   * @type {?string}
   */
  prefab_id?: string;

  /**
   * 碰撞标记，决定能与哪些对象碰撞
   * [WEMAKE]
   * @see {HitFlag}
   * @type {HitFlag}
   */
  hit_flag: HitFlag | number;

  /**
   * [LF2][WEMAKE]
   * 
   * @see {BdyKind}
   * @type {number}
   */
  kind: number | BdyKind;

  kind_name?: string;

  /**
   * 代码生成，用于bdy碰撞盒显示
   * [WEMAKE]
   * @type {?IQubePair}
   * @memberof IBdyInfo
   */
  indicator_info?: IQubePair;

  /**
   * 产生collision时，执行的actions
   * [WEMAKE]
   * @type {?TAction[]}
   * @memberof IBdyInfo
   */
  actions?: TAction[];

  test?: string;

  tester?: IExpression<any>;

  /**
   * 目前用途:
   *    firen存在code为123的itr, freeze存在code为123的bdy, 
   *    这个itr与bdy通过对方的code判断能否碰撞，再通过actions来实现合体。
   * [WEMAKE]
   * @file LF2/dat_translator/fighters/make_fighter_data_freeze.ts
   * @file LF2/dat_translator/fighters/make_fighter_data_firen.ts
   * @type {(string | number)}
   * @memberof IBdyInfo
   */
  code?: string | number,
}

let order = -1;
export const BdyKeyOrders: Record<keyof IBdyInfo, number> = {
  code: ++order,
  kind: ++order,
  kind_name: ++order,
  x: ++order,
  y: ++order,
  w: ++order,
  h: ++order,
  z: ++order,
  l: ++order,
  hit_flag: ++order,
  prefab_id: ++order,
  actions: ++order,
  test: ++order,
  tester: ++order,
  indicator_info: ++order,
}