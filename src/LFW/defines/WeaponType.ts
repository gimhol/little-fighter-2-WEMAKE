export enum WeaponType {
  None = 0,

  /**
   * 棍棒
   *
   * - 丢出方式：
   *    - 奔跑: 前 + 攻击
   *    - 空中: 前 + 攻击
   */
  Stick = 1,

  /** 重物类 */
  Heavy = 2,

  /**
   * 小刀类。
   * - 丢出方式：
   *    - 奔跑: 前 + 攻击
   *    - 空中: 前 + 攻击
   *    - 站立: 前 + 攻击
   */
  Knife = 3,

  /**
   * 棒球类
   */
  Baseball = 4,

  /**
   * 饮料
   *
   * - 丢出方式：
   *    - 奔跑: 前 + 攻击
   *    - 空中: 前 + 攻击
   *    - 冲跳: 前 + 攻击
   */
  Drink = 5
}
export const WeaponTypeDescriptions: Record<WeaponType, string> = {
  [WeaponType.None]: "",
  [WeaponType.Stick]: "",
  [WeaponType.Heavy]: "",
  [WeaponType.Knife]: "",
  [WeaponType.Baseball]: "",
  [WeaponType.Drink]: "",
}
export const WT = WeaponType;
export type WT = WeaponType;