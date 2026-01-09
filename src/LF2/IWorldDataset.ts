import { Difficulty } from "./defines/Difficulty";

export interface IWorldDataset {
  /**
   * 被击中的对象晃动多少帧
   *
   * @type {number}
   * @memberof IWorldDataset
   */
  itr_shaking: number;

  /**
   * 击中敌人的对象停顿多少帧
   *
   * @type {number}
   * @memberof IWorldDataset
   */
  itr_motionless: number;

  /**
   * dvx缩放系数
   *
   * @type {number}
   * @memberof IWorldDataset
   */
  fvx_f: number;

  /**
   * dvy缩放系数
   *
   * @type {number}
   * @memberof IWorldDataset
   */
  fvy_f: number;

  /**
   * dvz缩放系数
   *
   * @type {number}
   * @memberof IWorldDataset
   */
  fvz_f: number;
  ivy_f: number;
  ivz_f: number;
  ivx_f: number;
  ivy_d: number;
  ivx_d: number;

  /**
   * 停抓后VY
   * 
   * @type {number}
   * @memberof WorldDataset
   */
  cvy_d: number;

  /**
   * 停抓后VX
   * 
   * @type {number}
   * @memberof WorldDataset
   */
  cvx_d: number;

  /**
   * X轴丢人初速度缩放系数
   *
   * @type {number}
   */
  tvx_f: number;

  /**
   * Y轴丢人初速度缩放系数
   *
   * @type {number}
   */
  tvy_f: number;

  /**
   * Z轴丢人初速度缩放系数
   *
   * @type {number}
   */
  tvz_f: number;

  /**
   * 角色进入场地时的闪烁无敌时间
   *
   * @type {number}
   */
  begin_blink_time: number;

  /**
   * 倒地起身后的闪烁无敌时间
   *
   * @type {number}
   */
  lying_blink_time: number;

  /**
   * “非玩家槽角色”死亡时后的闪烁时间
   *
   * 闪烁完成后，非玩家槽角色应当被移除
   *
   * @type {number}
   * @memberof IWorldDataset
   */
  gone_blink_time: number;
  vrest_offset: number;
  arest_offset: number;
  arest_offset_2: number;

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
   * @memberof IWorldDataset
   */
  frame_wait_offset: number;

  cha_bc_spd: number;
  /** 
   * 角色倒地反弹判定速度X
   */
  cha_bc_tst_spd_x: number;
  /** 
   * 角色倒地反弹判定速度Y
   */
  cha_bc_tst_spd_y: number;
  hp_recoverability: number;

  /**
   * 暗血恢复周期
   * 每几帧回一次血
   */
  hp_r_ticks: number;

  /**
   * 暗血恢复量
   * 每次回血的回血量
   */
  hp_r_value: number;
  hp_healing_ticks: number;
  hp_healing_value: number;

  mp_r_ticks: number;
  mp_r_ratio: number;

  /**
   * 按键“双击”判定间隔，单位（帧数）
   *
   * 当同个按键在“双击判定间隔”之内按下两次，
   * 且中途未按下其对应冲突按键，视为“双击”。
   *
   */
  double_click_interval: number;

  /**
   * 按键“按下”/“双击”的判定持续帧，单位：帧数
   *
   * 当某按键被“按下”（不松开），接下来的数帧（数值key_hit_duration）内，均判定为“按下”。
   * 此时若存在对应的“按键‘按下’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘按下’跳转动作”。
   *
   * 当某双击后，接下来的数帧（数值key_hit_duration）内，均判定为“双击”。
   * 此时若存在对应的“按键‘双击’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘双击’跳转动作”。
   */
  key_hit_duration: number;
  friction_factor: number;
  friction_x: number;
  friction_z: number;
  screen_w: number;
  screen_h: number;
  gravity: number;
  sync_render: number;

  /**
   * 难度
   */
  difficulty: Difficulty;

  /**
   * 是否无限蓝
   */
  infinity_mp: boolean;

  
  /** 恢复周期(每几帧回一次) */
  fall_r_ticks: number;
  
  /** 恢复值(每次回多少) */
  fall_r_value: number;

  /** 恢复周期(每几帧回一次) */
  defend_r_ticks: number;

  /** 恢复值(每次回多少) */
  defend_r_value: number;
}
