import type { TAction } from "./TAction";
import type { Defines } from "./defines";
import type { HitFlag } from "./HitFlag";
import type { IExpression } from "./IExpression";
import type { TNextFrame } from "./INextFrame";
import type { IQube } from "./IQube";
import type { IQubePair } from "./IQubePair";
import type { ItrEffect } from "./ItrEffect";
import type { ItrKind } from "./ItrKind";

export type DEFAULT_ITR_MOTIONLESS = typeof Defines.DEFAULT_ITR_MOTIONLESS

export interface IItrInfo extends IQube {
  /**
   * 预制信息id
   *
   * @see {?string}
   */
  prefab_id?: string;

  /**
   *
   * @type {HitFlag}
   */
  hit_flag: HitFlag | number;
  hit_flag_name?: string;

  /**
   * 自身停顿值
   * - 命中后，自己停顿多少帧
   * - 不设置时存在默认值，见Defines.DEFAULT_ITR_MOTIONLESS
   *
   * @see {Defines.DEFAULT_ITR_MOTIONLESS}
   */
  motionless?: number;

  /**
   * 目标停顿值
   * - 命中后，目标停顿多少帧（伴随震动）
   * - 不设置时存在默认值，见Defines.DEFAULT_ITR_MOTIONLESS
   *
   * @see {Defines.DEFAULT_ITR_SHAKING}
   */
  shaking?: number;

  /**
   * 本itr的效果类型
   * 详细效果见ItrKind
   * @see {ItrKind}
   */
  kind: number | ItrKind;

  /** just for reading */
  kind_name?: string;

  dvx?: number;
  dvy?: number;
  dvz?: number;
  fall?: number;
  vrest?: number;
  arest?: number;

  /**
   * 破防值
   *
   * “防御状态”下的“受击目标”，击中时，其“格挡值”将被减去“破防值”，
   * 若“格挡值”小于0，“受击目标”将进入“破防动作”。
   *
   * 若非“防御状态”下的“受攻目标”存在“强硬值”，击中时，其“强硬值”将被减去“破防值”，
   * 若“强硬值”小于0，“受攻目标”被击中。
   */
  bdefend?: number;

  /** 伤害值 */
  injury?: number;

  /**
   * @see {ItrEffect}
   */
  effect?: number | ItrEffect;

  /** just for reading */
  effect_name?: string;

  indicator_info?: IQubePair;


  /**
   * 该itr抓到人时，攻击者进入的动作
   *
   * @type {?TNextFrame}
   * 
   * @see {ItrKind.Catch}
   * @see {ItrKind.ForceCatch}
   */
  catchingact?: TNextFrame;

  /**
   * 该itr抓到人时，被抓者进入的动作
   *
   * @type {?TNextFrame}
   * 
   * @see {ItrKind.Catch}
   * @see {ItrKind.ForceCatch}
   */
  caughtact?: TNextFrame;

  on_hit_ground?: TNextFrame;

  actions?: TAction[];

  /**
   * 测试表达式字符串
   */
  test?: string;

  /**
   * 测试碰撞是否满足条件
   * 
   * 当tester运行结果为false时，碰撞将不生效
   * 
   * tester根据test字符串，在读取数据时生成。
   *
   * @type {?IExpression<any>}
   * @type {?IExpression<any>['run']}
   * @see {IItrInfo.test}
   */
  tester?: IExpression<any>;
  code?: string | number,
}
