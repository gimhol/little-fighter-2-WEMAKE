/**
 * 朝向控制
 *
 * @export
 * @enum {number}
 */

export enum FacingFlag {
  None = 0,

  /** 向左 */
  Left = -1,

  /** 向右 */
  Right = 1,

  Backward = 2,

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

  SameAsCatcher = 4,

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

  VX = 7,
  
  AntiVX = 8,
}
