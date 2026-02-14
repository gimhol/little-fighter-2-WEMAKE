export enum StateEnum {
  _Entity_Base = -1,
  _Character_Base = -2,
  _Weapon_Base = -3,
  _Ball_Base = -4,

  Standing = 0,
  Walking = 1,
  Running = 2,
  Attacking = 3,
  Jump = 4,
  Dash = 5,
  Rowing = 6,

  /**
   * [LF2 & WEMAKE]
   * 防御状态
   *
   * 此状态下：
   *    - 防御值不会恢复
   * 
   * WEMAKE中，要实现防御与破防，需要结合
   * bdy.kind = BdyKind.Defend
   * bdy.actions = [{ type: 'broken_defend', data: { id: "112" } }]
   * 
   *
   * @see {Entity.self_update}
   */
  Defend = 7,

  /**
   * [LF2 & WEMAKE]
   * 破防
   *
   * 此状态下：
   *    - 防御值不会恢复
   *
   * @see {Entity.self_update}
   */
  BrokenDefend = 8,

  Catching = 9,
  Caught = 10,
  Injured = 11,
  Falling = 12,
  Frozen = 13,
  Lying = 14,

  Normal = 15,
  Tired = 16,

  /**
   * 消耗手中物品
   */
  Drink = 17,

  /**
   *
   */
  Burning = 18,

  /**
   * 原版中：此state，支持根据上下键与dvz控制角色Z轴移动，比如Firen的D>J。
   *
   * WEMAKE中，实现方式有所变动：
   *    改成上下键与speedz配合，控制角色Z轴移动速度。
   *    speedz可用于任意帧中。
   */
  BurnRun = 19,

  /**
   * 此状态下，在空中时(position.y > ground_y)，wait结束不会进入到next中.
   *
   * 但会在落地(position.y == 0)时进入next
   * 
   * 原版中：落地将进入94帧
   * @link https://www.lf-empire.de/lf2-empire/data-changing/reference-pages/182-states?start=21
   * 
   */
  NextAsLanding = 100,

  /**
   * 原版中：此state，用于支持根据上下键与dvz控制角色Z轴移动，比如Deep的D>J。
   *
   * WEMAKE中，实现方式有所变动：
   *    改成上下键与speedz配合，控制角色Z轴移动速度。
   *    speedz可用于任意帧中。
   */
  Z_Moveable = 301,

  TeleportToNearestEnemy = 400,
  TeleportToFarthestAlly = 401,

  Weapon_InTheSky = 1000,
  Weapon_OnHand = 1001,
  Weapon_Throwing = 1002,
  Weapon_Rebounding = 1003,
  Weapon_OnGround = 1004,

  HealSelf = 1700,

  HeavyWeapon_InTheSky = 2000,
  HeavyWeapon_OnHand = 2001,
  HeavyWeapon_JustOnGround = 2002,//= 重型武器在地上
  HeavyWeapon_OnGround = 2004,//= 与itr kind2作用

  Ball_Flying = 3000,
  Ball_Hitting = 3001,
  Ball_Hit = 3002,
  Ball_Rebounding = 3003,
  Ball_Disappear = 3004,
  Ball_3005 = 3005,
  Ball_3006 = 3006,
  TransformTo_Min = 8001,
  TransformTo_Max = 8999,
  /**
   * 变成LouisEX
   */
  TurnIntoLouisEX = 9995,
  /**
   * 原LF2的Louis爆甲
   * 但现在Wemake中，爆甲是通过opoint实现的。
   */
  OLD_LouisCastOff = 9996,

  Message = 9997,

  Gone = 9998,

  Weapon_Brokens = 9999,

  /**
   * 被存在变过的人时，此才允许进入state为500的frame。
   * rudolf抓人变身后，才能dja，你懂的。
   *
   * 但现在Wemake中，改为has_transform_data判断。
   */
  TransformToCatching_Begin = 500,

  /**
   * 变成最后一次曾经变过的人（rudolf的变身效果）
   */
  TransformToCatching_End = 501,
}

export const S_E = StateEnum;
export type S_E = StateEnum;
export const ATTCKING_STATES: readonly StateEnum[] = [
  StateEnum.Attacking,
  StateEnum.Ball_3005,
  StateEnum.Ball_3006,
  StateEnum.Ball_Flying,
  StateEnum.Ball_Hitting,
  StateEnum.Ball_Hit,
  StateEnum.BurnRun,
  StateEnum.Z_Moveable,
  StateEnum.HeavyWeapon_JustOnGround,
  StateEnum.Weapon_Throwing,
  StateEnum.Burning,
]
export const ALL_STATES = Object.keys(StateEnum).map(k => {
  const v = (StateEnum as any)[k]
  return typeof v === 'number' ? v : null
}).filter(v => v !== null)