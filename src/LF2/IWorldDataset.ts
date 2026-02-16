import { Difficulty } from "./defines/Difficulty";

export interface IWorldDataset {
  /** 被击中的对象晃动多少帧 */
  itr_shaking: number;

  /** 击中敌人的对象停顿多少帧 */
  itr_motionless: number;

  itr_arest: number;

  /** dvx缩放系数 */
  fvx_f: number;

  /** dvy缩放系数 */
  fvy_f: number;

  /** dvz缩放系数 */
  fvz_f: number;
  ivy_f: number;
  ivz_f: number;
  ivx_f: number;

  /** 默认itr.dvy */
  ivy_d: number;
  ivx_d: number;

  /** 停抓后VY */
  cvy_d: number;

  /** 停抓后VX */
  cvx_d: number;

  /** X轴丢人初速度缩放系数 */
  tvx_f: number;

  /**
   * Y轴丢人初速度缩放系数
   *
   * @type {number}
   */
  tvy_f: number;

  /** Z轴丢人初速度缩放系数 */
  tvz_f: number;

  /** 角色进入场地时的闪烁无敌时间 */
  begin_blink_time: number;

  /** 倒地起身后的闪烁无敌时间 */
  lying_blink_time: number;

  /** “非玩家角色”死亡时后的闪烁时间 */
  gone_blink_time: number;
  vrest_offset: number;
  arest_offset: number;

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

  /** 是否无限蓝 */
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
interface IFieldInfo {
  title: string;
  type: '' | 'int' | 'float' | 'boolean';
  desc?: string;
  min?: number;
  max?: number;
  step?: number;
}
export const world_field_map: Record<keyof IWorldDataset, IFieldInfo> = {
  gravity: { title: "重力", desc: "重力", type: 'float' },
  begin_blink_time: { title: "入场闪烁时长", desc: "入场闪烁时长", type: 'int' },
  gone_blink_time: { title: "消失闪烁时长", desc: "消失闪烁时长", type: 'int' },
  lying_blink_time: { title: "起身闪烁时长", desc: "起身闪烁时长", type: 'int' },
  double_click_interval: { title: "双击判定时长", desc: "双击判定时长", type: 'int' },
  key_hit_duration: { title: "按键判定时长", desc: "按键判定时长", type: 'int' },
  itr_shaking: { title: "受伤摇晃时长", desc: "受伤摇晃时长", type: 'int' },
  itr_motionless: { title: "命中停顿时长", desc: "命中停顿时长", type: 'int' },
  hp_healing_ticks: { title: "治疗回血周期", desc: "治疗效果下，每几帧回血一次", type: 'int' },
  hp_healing_value: { title: "治疗回血量", desc: "治疗效果下，每次回血多少", type: 'int' },
  fvx_f: { title: "frame.dvx缩放系数", type: 'float' },
  fvy_f: { title: "frame.dvy缩放系数", type: 'float' },
  fvz_f: { title: "frame.dvz缩放系数", type: 'float' },
  ivx_f: { title: "itr.dvx缩放系数", type: 'float' },
  ivy_f: { title: "itr.dvy缩放系数", type: 'float' },
  ivz_f: { title: "itr.dvz缩放系数", type: 'float' },
  ivy_d: { title: "itr.dvy默认值", desc: "默认的攻击Y轴速度", type: 'float' },
  ivx_d: { title: "itr.dvx默认值", desc: "默认的攻击X轴速度", type: 'float' },
  cvy_d: { title: "cvy_d", desc: "cvy_d", type: 'float' },
  cvx_d: { title: "cvx_d", desc: "cvx_d", type: 'float' },
  tvx_f: { title: "X轴丢人初速度系数", desc: "tvx_f", type: 'float' },
  tvy_f: { title: "Y轴丢人初速度系数", desc: "tvy_f", type: 'float' },
  tvz_f: { title: "Z轴丢人初速度系数", desc: "tvz_f", type: 'float' },
  vrest_offset: { title: "vrest_offset", desc: "vrest_offset", type: 'int' },
  arest_offset: { title: "arest_offset", desc: "arest_offset", type: 'int' },
  frame_wait_offset: { title: "frame_wait_offset", desc: "frame_wait_offset", type: 'int' },
  cha_bc_spd: { title: "cha_bc_spd", desc: "cha_bc_spd", type: 'float' },
  cha_bc_tst_spd_x: { title: "cha_bc_tst_spd_x", desc: "cha_bc_tst_spd_x", type: 'float' },
  cha_bc_tst_spd_y: { title: "cha_bc_tst_spd_y", desc: "cha_bc_tst_spd_y", type: 'float' },
  hp_recoverability: { title: "可回血比例", desc: "可回血比例", type: 'float' },
  hp_r_ticks: { title: "自动回血周期", desc: "每几帧回血一次", type: 'int' },
  hp_r_value: { title: "自动回血量", desc: "每次回血多少", type: 'int' },
  mp_r_ticks: { title: "自动回蓝周期", desc: "每几帧回蓝一次", type: 'int' },
  mp_r_ratio: { title: "mp_r_ratio", desc: "mp_r_ratio", type: 'int' },
  friction_factor: { title: "地速衰减系数", desc: "在地面的物体，速度将每帧乘以此值", type: 'float' },
  friction_x: { title: "地面摩擦X", desc: "在地面的物体，每帧X速度将±=此值,向0靠近", type: 'float' },
  friction_z: { title: "地面摩擦Z", desc: "在地面的物体，每帧Z速度将±=此值,向0靠近", type: 'float' },
  screen_w: { title: "screen_w", desc: "screen_w", type: '' },
  screen_h: { title: "screen_h", desc: "screen_h", type: '' },
  sync_render: { title: "sync_render", desc: "sync_render", type: '' },
  difficulty: { title: "difficulty", desc: "difficulty", type: '' },
  infinity_mp: { title: "infinity_mp", desc: "infinity_mp", type: 'boolean', min: 0, max: 1, step: 1 },
  fall_r_ticks: { title: "fall_r_ticks", desc: "fall_r_ticks", type: 'int' },
  fall_r_value: { title: "fall_r_value", desc: "fall_r_value", type: 'int' },
  defend_r_ticks: { title: "defend_r_ticks", desc: "defend_r_ticks", type: 'int' },
  defend_r_value: { title: "defend_r_value", desc: "defend_r_value", type: 'int' },
  itr_arest: { title: "itr_arest", desc: "itr_arest", type: 'int' },
}