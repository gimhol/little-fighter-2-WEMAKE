import type { IKeyEvent } from "./IKeyEvent";

export interface IKeyboardCallback {
  /**
   * 键按下
   *
   * @param {IKeyEvent} e
   */
  on_key_down?(e: IKeyEvent): void;

  /**
   * 键抬起
   *
   * @param {IKeyEvent} e
   */
  on_key_up?(e: IKeyEvent): void;
}
