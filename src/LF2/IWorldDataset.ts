import { Difficulty } from "./defines/Difficulty";
import { fields, float, int, invalid } from "./fields";

export interface IWorldDataset {
  itr_fall: number;
  /** 被击中的对象晃动多少帧 */
  itr_shaking: number;

  /** 角色 击中敌人的对象停顿多少帧 */
  itr_motionless: number;
  /** 波 击中敌人的对象停顿多少帧 */
  ball_itr_motionless: number;

  itr_arest: number;

  /** frame.dvx缩放系数 */
  fvx_f: number;

  /** frame.dvy缩放系数 */
  fvy_f: number;

  /** frame.dvz缩放系数 */
  fvz_f: number;

  /** itr.dvx缩放系数 */
  ivy_f: number;

  /** itr.dvy缩放系数 */
  ivz_f: number;

  /** itr.dvz缩放系数 */
  ivx_f: number;

  /** 
   * 默认itr.dvy
   * 默认击飞速度
   * @link https://lf-empire.de/forum/showthread.php?tid=11204
   */
  ivy_d: number;
  ivx_d: number;

  /** 停抓后VY */
  cvy_d: number;

  /** 停抓后VX */
  cvx_d: number;

  /** X轴丢人初速度缩放系数 */
  tvx_f: number;

  /** Y轴丢人初速度缩放系数 */
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
  min_vrest: number;
  arest_offset: number;
  min_arest: number;

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
   */
  wait_offset: number;

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
  /** 地面摩擦X 在地面的物体，每帧X速度将±=此值,向0靠近 */
  friction_x: number;
  /** 地面摩擦Z 在地面的物体，每帧Z速度将±=此值,向0靠近 */
  friction_z: number;

  land_friction_factor: number,
  /** 落地帧摩擦X，每帧X速度将±=此值,向0靠近 */
  land_friction_x: number;
  /** 落地帧摩擦Z，每帧Z速度将±=此值,向0靠近 */
  land_friction_z: number;

  screen_w: number;
  screen_h: number;
  /** 重力加速度 */
  gravity: number;
  /** 重力加速度（按着防御时） */
  gravity_d: number;
  weapon_throwing_gravity: number;
  sync_render: number;

  /** 难度 */
  difficulty: Difficulty;

  /** 是否无限蓝 */
  infinity_mp: number;


  /** 恢复周期(每几帧回一次) */
  fall_r_ticks: number;

  /** 恢复值(每次回多少) */
  fall_r_value: number;

  /** 恢复周期(每几帧回一次) */
  defend_r_ticks: number;

  /** 恢复值(每次回多少) */
  defend_r_value: number;

  fall_value: number;
  catch_time_max: number;
  defend_value_max: number;
  /** 防御生效时，仍扣除多少比例的血(0~1) */
  defend_ratio: number;
  mp: number;
  hp: number;
  resting_max: number;
  vrest_after_shaking: number;
  arest_after_motionless: number;
  invisible_blinking: number;
  jump_x_f: number;
  jump_z_f: number;
  jump_h_f: number;
  dash_x_f: number;
  dash_z_f: number;
  dash_h_f: number;
  bfall_x_f: number;
  bfall_h_f: number;
  jump_height: number;
  jump_distance: number;
  jump_distancez: number;
  dash_height: number;
  dash_distance: number;
  dash_distancez: number;
  /** 默认受身速度Y */
  rowing_height: number;
  /** 默认受身速度X */
  rowing_distance: number;
  wvx_f: number;
  wvy_f: number;
  wvz_f: number;
  whirlwind_vy_max: number;
  whirlwind_acc_y: number;
  whirlwind_acc_x: number;
  whirlwind_acc_z: number;
  teamoutline_enabled: number;
  indicator_flags: number;
  UPS: number;
  playrate: number;
  atom_time: number;
}

export const world_dataset_fields = fields<IWorldDataset>({
  gravity: float("重力"),
  gravity_d: float("重力D"),
  jump_x_f: float("跳跃X速度系数"),
  jump_h_f: float("跳跃Y速度系数"),
  jump_z_f: float("跳跃Z速度系数"),
  dash_x_f: float("跑跳X速度系数"),
  dash_h_f: float("跑跳Y速度系数"),
  dash_z_f: float("跑跳Z速度系数"),
  bfall_x_f: float("受身速度系数X"),
  bfall_h_f: float("受身速度系数Y"),
  weapon_throwing_gravity: float("投掷武器重力"),
  begin_blink_time: int("入场闪烁时长"),
  gone_blink_time: int("消失闪烁时长"),
  lying_blink_time: int("起身闪烁时长"),
  double_click_interval: int("双击判定时长"),
  key_hit_duration: int("按键判定时长"),
  itr_shaking: int("受伤摇晃时长"),
  itr_motionless: int("角色命中停顿时长"),
  ball_itr_motionless: int("波命中停顿时长"),
  hp_healing_ticks: int("治疗回血周期", "治疗效果下，每几帧回血一次"),
  hp_healing_value: int("治疗回血量", "治疗效果下，每次回血多少"),
  fvx_f: float("frame.dvx缩放系数"),
  fvy_f: float("frame.dvy缩放系数"),
  fvz_f: float("frame.dvz缩放系数"),
  ivx_f: float("itr.dvx缩放系数"),
  ivy_f: float("itr.dvy缩放系数"),
  ivz_f: float("itr.dvz缩放系数"),
  ivy_d: float("itr.dvy默认值", "默认的攻击Y轴速度"),
  ivx_d: float("itr.dvx默认值", "默认的攻击X轴速度"),
  cvx_d: float("停抓vx", "抓人结束时，被抓者的速度X"),
  cvy_d: float("停抓vy", "抓人结束时，被抓者的速度Y"),
  tvx_f: float("丢人速度系数X"),
  tvy_f: float("丢人速度系数Y"),
  tvz_f: float("丢人速度系数Z"),
  wvx_f: float("丢武器速度系数X"),
  wvy_f: float("丢武器速度系数Y"),
  wvz_f: float("丢武器速度系数Z"),
  vrest_offset: int,
  min_vrest: int,
  itr_arest: int,
  arest_offset: int,
  min_arest: int,
  wait_offset: int,
  cha_bc_spd: float,
  cha_bc_tst_spd_x: float,
  cha_bc_tst_spd_y: float,
  hp_recoverability: float("可回血比例", "可回血比例"),
  hp_r_ticks: int("回血周期", "每几帧回血一次"),
  hp_r_value: int("回血量", "每次回血多少"),
  mp_r_ticks: int("回蓝周期", "每几帧回蓝一次"),
  mp_r_ratio: int("回蓝速率系数"),
  friction_factor: float("地速衰减系数", "在地面的物体，速度将每帧乘以此值"),
  friction_x: float("地面摩擦X", "在地面的物体，每帧X速度将±=此值,向0靠近"),
  friction_z: float("地面摩擦Z", "在地面的物体，每帧Z速度将±=此值,向0靠近"),
  land_friction_factor: float("落地摩擦X", "在物体着地时，当前动作结束前，速度将每帧乘以此值"),
  land_friction_x: float("落地摩擦X", "在物体着地时，当前动作结束前，每帧X速度将±=此值,向0靠近"),
  land_friction_z: float("落地摩擦Z", "在物体着地时，当前动作结束前，每帧Z速度将±=此值,向0靠近"),
  screen_w: invalid,
  screen_h: invalid,
  sync_render: invalid,
  difficulty: int,
  infinity_mp: int("无限MP", "无限MP, 1=无限, 0=有限(默认)", { min: 0, max: 1 }),
  fall_r_ticks: int("摔落值恢复周期", "每几帧恢复一次摔落值"),
  fall_r_value: int("摔落值恢复量", "每次恢复多少摔落值"),
  defend_r_ticks: int("防御值恢复周期", "每几帧恢复一次防御值"),
  defend_r_value: int("防御值恢复量", "每次恢复多少防御值"),
  fall_value: int("摔落值", "默认摔落值"),
  catch_time_max: int,
  defend_value_max: int,
  defend_ratio: int,
  mp: int,
  hp: int,
  resting_max: int,
  vrest_after_shaking: int("vrest是否在shaking后更新", "vrest是否在shaking后更新", { min: 0, max: 1 }),
  arest_after_motionless: int("arest是否在motionless后更新", "arest是否在motionless后更新", { min: 0, max: 1 }),
  invisible_blinking: int("隐身结束后的闪烁时长", "隐身结束后的闪烁时长", { min: 0, max: 9999 }),
  jump_height: float,
  jump_distance: float,
  jump_distancez: float,
  dash_height: float,
  dash_distance: float,
  dash_distancez: float,
  rowing_height: float,
  rowing_distance: float,
  whirlwind_vy_max: float('旋风最大Y速度'),
  whirlwind_acc_y: float('旋风Y加速度'),
  whirlwind_acc_x: float('旋风X加速度'),
  whirlwind_acc_z: float('旋风Z加速度'),
  itr_fall: int,
  teamoutline_enabled: int({ min: 0, max: 1 }),
  indicator_flags: int,
  UPS: int({ min: 1, max: 120 }),
  playrate: float({ min: 0.01, max: 1000 }),
  atom_time: float
})