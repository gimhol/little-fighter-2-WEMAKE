export enum SpeedCtrl {
  /** 一直响应 */
  None = 0,
  /** 按下按键时，根据按键方向响应 */
  Control = 1,
  /** 按下按键时，开始响应 */
  Enable = 2,
  /** 按下按键时，停止响应 */
  Disable = 3,
}
