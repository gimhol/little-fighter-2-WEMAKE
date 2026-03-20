import { BdyKind } from "./BdyKind";
import { HitFlag } from "./HitFlag";
import type { IExpression } from "./IExpression";
import type { IQube } from "./IQube";
import type { IQubePair } from "./IQubePair";
import { make_field_orders } from "./make_field_orders";
import type { TAction } from "./TAction";

export interface IBdyInfo extends Partial<IQube> {
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
  hit_flag?: HitFlag | number;
  hit_flag_name?: string;

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

export const BdyKeyOrders = make_field_orders({
  kind: 0, kind_name: 0,
  x: 0, y: 0, w: 0, h: 0, z: 0, l: 0,
  hit_flag: 0,
  hit_flag_name: 0,
  prefab_id: 0,
  actions: 0,
  test: 0,
  code: 0,
  tester: 0,
  indicator_info: 0,
})