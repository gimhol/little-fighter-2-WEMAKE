import type { IWorldDataset } from "../IWorldDataset";
import { FacingFlag } from "./FacingFlag";
import { FrameBehavior } from "./FrameBehavior";
import type { IBdyInfo } from "./IBdyInfo";
import type { IBpointInfo } from "./IBpointInfo";
import { IChaseInfo } from "./IChaseInfo";
import type { ICpointInfo } from "./ICpointInfo";
import type { IFramePictureInfo } from "./IFramePictureInfo";
import type { IHitKeyCollection } from "./IHitKeyCollection";
import type { IHoldKeyCollection } from "./IHoldKeyCollection";
import type { IItrInfo } from "./IItrInfo";
import type { TNextFrame } from "./INextFrame";
import type { IOpointInfo } from "./IOpointInfo";
import type { IQubePair } from "./IQubePair";
import type { IVelocityInfo } from "./IVelocityInfo";
import type { IWpointInfo } from "./IWpointInfo";
import type { StateEnum } from "./StateEnum";

/**
 * 实体的帧信息
 *
 * @export
 * @interface IFrameInfo
 */
export interface IFrameInfo extends Partial<IWorldDataset>, IVelocityInfo {

  /**
   * 帧ID
   * 
   * 每个实体的帧ID不允许重复
   *
   * 对应LF2 数据里`<frame> id name` 的 `id`;
   * 
   * LF2 的 `frame.id` 只能是 >= 0 && <= 399 的整帧数；
   * 
   * LFW 的 `frame.id` 则为字符串
   * 
   * @type {string}
   */
  id: string;

  /**
   * 帧名
   * 
   * 对应LF2数据里 `<frame> id name` 的 `name`；
   * 
   * 似乎仅仅用来方便人看的；
   * 
   * @type {string}
   */
  name: string;


  /**
   * 帧切图
   * 
   * LF2中, 这是个切图网格的索引数字；
   * 
   * LFW中，已改为通过图片ID+切图矩形表示；
   * 
   * @type {?IFramePictureInfo}
   */
  pic?: IFramePictureInfo;

  /**
   *
   * @see {StateEnum}
   * @type {number}
   */
  state: number | StateEnum;

  /**
   * 帧等待数
   * 
   * 本帧持续多长时间
   * 
   * @type {number}
   */
  wait: number;

  /**
   * wait end, what next?
   *
   * @type {TNextFrame}
   */
  next: TNextFrame;

  /**
   * 脚点x坐标（相对帧切图的x）
   * 
   * 简单的来说：
   * 
   * 角色地面接触时，玩家可见“帧切图”的 centerx, centery 将位于影子的中心
   * 
   * @type {number}
   */
  centerx: number;

  /**
   * 脚点y坐标（相对帧切图的y）
   * 
   * 简单的来说：
   * 
   * 角色地面接触时，玩家可见“帧切图”的 centerx, centery 将位于影子的中心
   * 
   * @type {number}
   */
  centery: number;

  width: number;
  height: number;
  
  /**
   * 进入此帧时播放的声音
   *
   * @type {?string}
   */
  sound?: string;

  /**
   * 此frame消耗的血量，每帧都会扣
   *
   * 原版的角色消耗mp与hp见INextFrame
   *
   * @see {INextFrame}
   */
  hp_max?: number;

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


  chase?: IChaseInfo;

  /**
   * 是否响应重力
   */
  gravity_enabled?: boolean;

  /**
   * 这个好像不太好
   */
  broadcasts?: string[];

  facing?: FacingFlag;


  /**
   * 决定了帧的落地行为
   * 
   * - ball.frame.landable 默认为 0
   * - weapon.frame.landable 默认为 1
   * - fighter.frame.landable 默认为 1
   * 
   * - 可用值: 
   *    - 0 = 不与地面反应，将掉落到地面以下
   *    - 1 = 与地面接触时，y速度归0，进入frame.on_landing，播放drop_sounds
   *
   * @type {?number}
   */
  landable?: number;


  /* 为渲染层预留的玩意 */
  __tex?: any;

  /** 
   * 是否根据lf2逻辑预处理此frame 
   */
  likelf2?: boolean;

  __aabb_x1?: number;
  __aabb_x2?: number;
}

