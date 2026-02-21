import type { FacingFlag } from "./FacingFlag";
import type { TNextFrame } from "./INextFrame";
import { IQubePair } from "./IQubePair";
import type { OpointKind } from "./OpointKind";
import type { OpointMultiEnum } from "./OpointMultiEnum";
import { OpointSpreading } from "./OpointSpreading";
export type __KEEP_FacingFlag = FacingFlag;
export interface IOpointInfo {
  /**
   *
   * @type {number}
   * @memberof IOpointInfo
   * @see {OpointKind}
   */
  kind: number | OpointKind;

  /**
   * 实体产生的X坐标（相对frame矩形左上角）
   * @type {number}
   */
  x: number;

  /**
   * 实体产生的Y坐标（相对frame矩形左上角）
   * @type {number}
   */
  y: number;

  origin_type?: number;

  z?: number;
  /**
   * 实体数据ID
   *
   * @type {string | string[]}
   */
  oid: string | string[];

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 生成物体处于哪一帧
   *
   * - 在原版中：
   *    - action仅仅是个数字，指向某个帧.
   *
   * - 在WEMAKE中：
   *    - action是INextFrame(或多个INextFrame)
   *
   * @type {TNextFrame}
   */
  action: TNextFrame;

  /**
   * 发射初速度
   */
  dvx?: number;

  /**
   * 发射初速度
   */
  dvy?: number;

  /**
   * 发射初速度
   */
  dvz?: number;

  /**
   * 用于：
   * * [ ] LF2
   * * [X] WEMAKE
   *
   * 生成数量。
   *
   * - 在原版中：
   *    - 生成物体的数量是通过facing实现的，facing的十位数以上为数量（数量=facing整除10）
   *    - 个位数为方向，0表示与发射者朝向相同，1表示与发射者朝向相反
   *
   * - 在WEMAKE中：
   *    - multi即代表生成数量，默认为1，若小于1，则什么都不会生成。
   *    - 生成物的朝向见通过action的facing决定
   *
   * @see {FacingFlag}
   * @type {?number}
   */
  multi?: number | {
    /** 生成数量的决定方式 */
    type: OpointMultiEnum;
    /** 数量零时，将不生成（数量需参见决定方式） */
    skip_zero?: boolean
    /** 至少产生多少个 */
    min?: number;
    /** 至多产生多少个 */
    max?: number;
  };

  /**
   * 最大血量
   * 将覆盖原实体的最大血量
   */
  max_hp?: number;

  /**
   * 生成后的血量
   * 将覆盖原实体的血量
   */
  hp?: number;

  /**
   * 生成后的最大血量
   * 将覆盖原实体的最大血量
   */
  max_mp?: number;

  mp?: number;

  speedz?: number;

  /**
   * 用于：
   * * [ ] LF2
   * * [X] WEMAKE
   *
   * 扩散模式
   *
   * 当multi大于1，扩散模式生效。
   * @see OpointSpreading
   */
  spreading?: number | OpointSpreading;

  /**
   * 
   */
  is_entity?: boolean;

  interval?: number;
  interval_id?: string;
  interval_mode?: 1 | 0;
  indicator_info?: IQubePair;
}
