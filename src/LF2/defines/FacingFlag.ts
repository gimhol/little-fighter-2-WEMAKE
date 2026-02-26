/**
 * 朝向控制
 *
 * @export
 * @enum {number}
 */

export enum FacingFlag {
  None = 0,

  /** 向左 */
  L = -1, Left = L,

  /** 向右 */
  R = 1, Right = R,

  /** 
   * 转向 
   * 
   * 要谨慎，否则会鬼畜
   */
  B = 2, Backward = B,

  /**
   * 跟随控制器
   *
   * - entity.controller.LR == -1时，向左
   * - entity.controller.LR == 1时，向右
   * - 否则维持原方向
   * @see {BaseController.LR}
   * @see {Entity.controller}
   */
  Ctrl = 3,

  /**
   * 与随抓住自己的同向
   * 当未被抓住，则保持原样
   */
  SameAsCatcher = 4,

  /**
   * 与随抓住自己的反向
   * 当未被抓住，则保持原样
   */
  OpposingCatcher = 5,

  /**
   * 与控制器相反
   *
   * - entity.controller.LR == -1时，向右
   * - entity.controller.LR == 1时，向左
   * - 否则维持原方向
   * @see {BaseController.LR}
   * @see {Entity.controller}
   */
  AntiCtrl = 6,

  /**
   * 跟随X速度
   * 
   * - X速度>0 时，向右
   * - X速度<0 时，向左
   * - X速度=0 时，保持
   */
  VX = 7,

  /**
   * 跟随反X速度
   * 
   * - X速度<0 时，向右
   * - X速度>0 时，向左
   * - X速度=0 时，保持
   */
  AntiVX = 8,

  /**
   * 跟随按键与速度趋势
   * 
   * @see {FacingFlag.VX}
   * @see {FacingFlag.Ctrl}
   * 
   * - 当未按下 L|R 时，表现与VX一致 
   * - 当按下 L|R 时，表现与Ctrl一致 
   */
  Trend = 9,

  /**
   * 与随持有自己的同向
   * 当未被抓住，则保持原样
   */
  SameAsBearer = 4,

  /**
   * 与随持有自己的反向
   * 当未被抓住，则保持原样
   */
  OpposingBearer = 5,
}
