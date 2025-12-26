import { IVector3 } from "../defines";
import { IUIPointerEvent } from "./IUIPointerEvent";
import { LF2UIEvent } from "./LF2UIEvent";


export class LF2PointerEvent extends LF2UIEvent implements IUIPointerEvent {
  readonly point: IVector3;
  readonly button: number;
  constructor(vec3: IVector3, btn: number) {
    super()
    this.point = vec3;
    this.button = btn
  }
}
