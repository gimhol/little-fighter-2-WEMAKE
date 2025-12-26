import type { IUIEvent } from "./UIEvent";


export interface IUIPointerEvent extends IUIEvent {
  button: number;
}
