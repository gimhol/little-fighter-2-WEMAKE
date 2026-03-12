import { Defines, Difficulty } from "./defines";
import { IWorldDataset, world_dataset_field_map as world_dataset_fields } from "./IWorldDataset";
import { make_private_properties } from "./utils/make_private_properties";
import wdataset from './world.wdataset.json';
export class WorldDataset implements IWorldDataset {
  static readonly TAG: string = 'WorldDataset';
  /** 
   * 被击中的对象晃动多少帧
   *
   * @type {number}
   * @memberof World
   */
  itr_shaking: number = Defines.DEFAULT_ITR_SHAKING;

  /**
   * 击中敌人的对象停顿多少帧
   *
   * @type {number}
   * @memberof World
   */
  itr_motionless: number = Defines.DEFAULT_ITR_MOTIONLESS;

  /**
   * dvx缩放系数
   *
   * @type {number}
   * @memberof World
   */
  fvx_f: number = 0.5;

  /**
   * dvy缩放系数
   *
   * @type {number}
   * @memberof World
   */
  fvy_f: number = -0.5;

  /**
   * dvz缩放系数
   *
   * @type {number}
   * @memberof World
   */
  fvz_f: number = 1;

  /** 
   * about freeze 
   */
  ivx_f: number = 1;
  ivy_f: number = 1.18;
  ivz_f: number = 1;

  ivy_d: number = 3.8;
  ivx_d: number = 4;
  cvy_d: number = 3;
  cvx_d: number = 2;

  /**
   * X轴丢人速度系数
   *
   * @type {number}
   */
  tvx_f: number = 0.5;

  /**
   * Y轴丢人速度系数
   *
   * @type {number}
   */
  tvy_f: number = -0.625;

  /**
   * Z轴丢人速度系数
   *
   * @type {number}
   */
  tvz_f: number = 0.5;

  /**
   * 角色进入场地时的闪烁无敌时间
   *
   * @type {number}
   */
  begin_blink_time: number = 144;

  /**
   * 倒地起身后的闪烁无敌时间
   *
   * @type {number}
   */
  lying_blink_time: number = 32;

  /**
   * “非玩家槽角色”死亡时后的闪烁时间
   * 
   * 闪烁完成后，非玩家槽角色应当被移除
   *
   * @type {number}
   * @memberof World
   */
  gone_blink_time: number = 56;
  vrest_offset: number = -6;
  itr_arest: number = Defines.DEFAULT_ITR_A_REST;
  min_arest: number = 2;
  min_vrest: number = 2;
  arest_offset: number = -6;

  /**
   * “帧等待数”偏移值
   * 
   * @note
   * “帧等待数”会在每次更新中减一
   * 每一帧会在“帧等待数”归零时，尝试进入下一帧。
   * 
   * 有：“帧等待数” = “帧本身的帧等待数” + “帧等待数”偏移值
   * 
   * @see {IFrameInfo.wait} 帧本身的“帧等待数”
   * 
   * @type {number}
   * @memberof World
   */
  frame_wait_offset: number = 0;

  cha_bc_spd: number = 2;
  cha_bc_tst_spd_x: number = 5;
  cha_bc_tst_spd_y: number = -2.6;
  hp_recoverability: number = 0.66;
  hp_r_ticks: number = 24;
  hp_r_value: number = 1;
  hp_healing_ticks: number = 16;
  hp_healing_value: number = 8;

  mp_r_ticks: number = 6;
  mp_r_ratio: number = 1;

  /**
   * 按键“双击”判定间隔，单位（帧数）
   *
   * 当同个按键在“双击判定间隔”之内按下两次，
   * 且中途未按下其对应冲突按键，视为“双击”。
   *
   */
  double_click_interval: number = 30;

  /**
   * 按键“按下”/“双击”的判定持续帧，单位：帧数
   *
   * 当某按键被“按下”（不松开），接下来的数帧（数值key_hit_duration）内，均判定为“按下”。
   * 此时若存在对应的“按键‘按下’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘按下’跳转动作”。
   *
   * 当某双击后，接下来的数帧（数值key_hit_duration）内，均判定为“双击”。
   * 此时若存在对应的“按键‘双击’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘双击’跳转动作”。
   */
  key_hit_duration: number = 10;
  friction_factor: number = 1;
  /**
   * 地面摩擦X 在地面的物体，每帧X速度将±=此值,向0靠近
   *
   * @type {number}
   * @memberof WorldDataset
   */
  friction_x: number = 0.25;
  /**
   * 地面摩擦Z 在地面的物体，每帧Z速度将±=此值,向0靠近
   *
   * @type {number}
   * @memberof WorldDataset
   */
  friction_z: number = 0.25;

  land_friction_factor: number = 1;
  /**
   * 地面摩擦X 在地面的物体，每帧X速度将±=此值,向0靠近
   *
   * @type {number}
   * @memberof WorldDataset
   */
  land_friction_x: number = 1;
  /**
   * 地面摩擦Z 在地面的物体，每帧Z速度将±=此值,向0靠近
   *
   * @type {number}
   * @memberof WorldDataset
   */
  land_friction_z: number = 0.5;

  screen_w: number = Defines.MODERN_SCREEN_WIDTH;
  screen_h: number = Defines.MODERN_SCREEN_HEIGHT;
  gravity: number = 0.4375;
  weapon_throwing_gravity: number = 0.21875;
  sync_render: number = 0;
  difficulty: Difficulty = Difficulty.Difficult;
  infinity_mp: number = 0;
  fall_r_ticks: number = 1;
  fall_r_value: number = 1;
  defend_r_ticks: number = 1;
  defend_r_value: number = 1;
  fall_value: number = 140;
  catch_time_max: number = 680;
  defend_value_max: number = 90;
  /**
   * 防御生效时，仍扣除多少比例的血
   *
   * @type {number}
   */
  defend_ratio: number = 0.1;
  mp: number = 500;
  hp: number = 500;
  resting_max: number = 40;
  vrest_after_shaking: number = 1;
  arest_after_motionless: number = 1;
  invisible_blinking: number = 120;
  jump_x_f: number = 0.5;
  jump_z_f: number = 1;
  jump_h_f: number = -0.5;
  dash_x_f: number = 0.5;
  dash_z_f: number = 1;
  dash_h_f: number = -0.5;
  bfall_x_f: number = 0.5;
  bfall_h_f: number = -0.5;

  jump_height: number = -16.299999;
  jump_distance: number = 8;
  jump_distancez: number = 3;
  dash_height: number = -11;
  dash_distance: number = 15;
  dash_distancez: number = 3.750000;
  /** 默认受身速度Y */
  rowing_height: number = -2.000000;
  /** 默认受身速度X */
  rowing_distance: number = 5;
  wvx_f: number = 0.5;
  wvy_f: number = -0.5;
  wvz_f: number = 1;

  constructor() {
    make_private_properties(`${WorldDataset.TAG}::constructor`, this, (...args) => this.on_dataset_change?.(...args))
    Object.assign(this, wdataset)
  }
  on_dataset_change?: (k: string, curr: any, prev: any) => void;
  dump_dataset() {
    const ret: any = {}
    for (const k in world_dataset_fields)
      ret[k] = (this as any)[k];
    return ret;
  }
}