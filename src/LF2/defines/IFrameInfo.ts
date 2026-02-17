import { IWorldDataset } from "../IWorldDataset";
import { ChaseLost } from "./ChaseLost";
import { FacingFlag } from "./FacingFlag";
import { FrameBehavior } from "./FrameBehavior";
import { HitFlag } from "./HitFlag";
import type { IBdyInfo } from "./IBdyInfo";
import type { IBpointInfo } from "./IBpointInfo";
import type { ICpointInfo } from "./ICpointInfo";
import type { IFramePictureInfo } from "./IFramePictureInfo";
import type { IHitKeyCollection } from "./IHitKeyCollection";
import type { IHoldKeyCollection } from "./IHoldKeyCollection";
import type { IItrInfo } from "./IItrInfo";
import type { TNextFrame } from "./INextFrame";
import type { IOpointInfo } from "./IOpointInfo";
import type { IQubePair } from "./IQubePair";
import type { IWpointInfo } from "./IWpointInfo";
import type { SpeedMode } from "./SpeedMode";
import type { StateEnum } from "./StateEnum";

/**
 * 实体的帧信息
 *
 * @export
 * @interface IFrameInfo
 */
export interface IFrameInfo extends Partial<IWorldDataset> {
  /**
   * 帧ID
   * 
   * 每个实体的帧ID不允许重复
   *
   * @type {string}
   * @memberof IFrameInfo
   */
  id: string;

  /**
   * 帧名
   *
   * @type {string}
   * @memberof IFrameInfo
   */
  name: string;

  pic?: IFramePictureInfo;

  /**
   *
   * @see {StateEnum}
   * @type {number}
   * @memberof IFrameInfo
   */
  state: number | StateEnum;

  /**
   * 帧等待数
   * 
   * 本帧持续多长时间
   * 
   * @type {number}
   * @memberof IFrameInfo
   */
  wait: number;

  /**
   * wait end, what next?
   *
   * @type {TNextFrame}
   */
  next: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  acc_x?: number;
  acc_y?: number;
  acc_z?: number;
  /** @see {SpeedMode} */
  vxm?: number | SpeedMode;
  /** @see {SpeedMode} */
  vym?: number | SpeedMode;
  /** @see {SpeedMode} */
  vzm?: number | SpeedMode;
  ctrl_x?: number;
  ctrl_y?: number;
  ctrl_z?: number;


  centerx: number;
  centery: number;
  sound?: string;

  /**
   * 此frame消耗的血量，每帧都会扣
   *
   * 原版的角色消耗mp与hp见INextFrame
   *
   * @see {INextFrame}
   */
  hp?: number;

  hold?: IHoldKeyCollection;
  hit?: IHitKeyCollection;
  key_down?: IHoldKeyCollection;
  key_up?: IHoldKeyCollection;
  seqs?: { [x in string]?: TNextFrame; };
  seq_map?: Map<string, TNextFrame>;
  bdy?: IBdyInfo[];
  itr?: IItrInfo[];
  wpoint?: IWpointInfo;
  bpoint?: IBpointInfo;
  opoint?: IOpointInfo[];
  cpoint?: ICpointInfo;
  indicator_info?: IQubePair;

  /**
   * 隐身多少帧
   * 
   * @type {?number}
   */
  invisible?: number;
  no_shadow?: number;

  /**
   * 起跳标志（角色专用）
   *
   * 从state为```StateEnum.Jump```的frame，
   * 跳至state为```StateEnum.Jump```的frame时，
   * 若前（frame.jump_flag == 1）且后（frame.jump_flag == 0）或空。
   * 此时将会计算跳跃速度，让角色跳起来。
   *
   * @see {StateEnum.Jump}
   * @type {?number}
   */
  jump_flag?: number;

  /**
   * 死亡后跳转
   *
   * hp从正数降至小于等于0时，跳转至on_dead中符合条件的帧
   *
   * @type {?TNextFrame}
   */
  on_dead?: TNextFrame;

  on_exhaustion?: TNextFrame;

  /**
   * Description placeholder
   *
   * @type {?TNextFrame}
   */
  on_landing?: TNextFrame;

  /**
   * 原ball的hit_Fa
   * 
   * 跟踪效果改由chase决定
   *
   * @type {?number}
   * @see {FrameBehavior}
   */
  behavior?: number | FrameBehavior;


  chase?: {
    /**
     * 跟踪对象的标志
     */
    flag: number | HitFlag

    /** 
     * 跟踪对象丢失后的行为
     */
    lost?: number | ChaseLost;


    oy?: number
  };

  /**
   * 是否响应重力
   */
  gravity_enabled?: boolean;


  broadcasts?: string[];

  facing?: FacingFlag;
}


let order = -1;
export const FrameFieldOrders: Record<keyof IFrameInfo, number> = {
  id: ++order,
  name: ++order,
  pic: ++order,
  state: ++order,
  wait: ++order,
  next: ++order,
  centerx: ++order,
  centery: ++order,
  dvx: ++order,
  dvy: ++order,
  dvz: ++order,
  acc_x: ++order,
  acc_y: ++order,
  acc_z: ++order,
  vxm: ++order,
  vym: ++order,
  vzm: ++order,
  ctrl_x: ++order,
  ctrl_y: ++order,
  ctrl_z: ++order,
  itr: ++order,
  bdy: ++order,
  opoint: ++order,
  cpoint: ++order,
  wpoint: ++order,
  bpoint: ++order,
  sound: ++order,
  hp: ++order,
  hold: ++order,
  hit: ++order,
  key_down: ++order,
  key_up: ++order,
  seqs: ++order,
  seq_map: ++order,
  indicator_info: ++order,
  invisible: ++order,
  no_shadow: ++order,
  jump_flag: ++order,
  on_dead: ++order,
  on_exhaustion: ++order,
  on_landing: ++order,
  behavior: ++order,
  chase: ++order,
  friction_z: ++order,
  friction_x: ++order,
  friction_factor: ++order,
  gravity: ++order,
  gravity_enabled: ++order,
  broadcasts: ++order,
  facing: ++order,
  itr_shaking: ++order,
  itr_motionless: ++order,
  itr_arest: ++order,
  fvx_f: ++order,
  fvy_f: ++order,
  fvz_f: ++order,
  ivy_f: ++order,
  ivz_f: ++order,
  ivx_f: ++order,
  ivy_d: ++order,
  ivx_d: ++order,
  cvy_d: ++order,
  cvx_d: ++order,
  tvx_f: ++order,
  tvy_f: ++order,
  tvz_f: ++order,
  begin_blink_time: ++order,
  lying_blink_time: ++order,
  gone_blink_time: ++order,
  vrest_offset: ++order,
  arest_offset: ++order,
  frame_wait_offset: ++order,
  cha_bc_spd: ++order,
  cha_bc_tst_spd_x: ++order,
  cha_bc_tst_spd_y: ++order,
  hp_recoverability: ++order,
  hp_r_ticks: ++order,
  hp_r_value: ++order,
  hp_healing_ticks: ++order,
  hp_healing_value: ++order,
  mp_r_ticks: ++order,
  mp_r_ratio: ++order,
  double_click_interval: ++order,
  key_hit_duration: ++order,
  land_friction_factor: ++order,
  land_friction_x: ++order,
  land_friction_z: ++order,
  screen_w: ++order,
  screen_h: ++order,
  sync_render: ++order,
  difficulty: ++order,
  infinity_mp: ++order,
  fall_r_ticks: ++order,
  fall_r_value: ++order,
  defend_r_ticks: ++order,
  defend_r_value: ++order,
  fall_value_max: ++order,
  catch_time_max: ++order,
  defend_value_max: ++order,
  defend_ratio: ++order,
  mp_max: ++order,
  hp_max: ++order,
  resting_max: ++order
}