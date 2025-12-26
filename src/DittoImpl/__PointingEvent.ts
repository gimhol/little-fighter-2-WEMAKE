import { IPointingEvent } from "../LF2/ditto";

export class __PointingEvent implements IPointingEvent {
  readonly is_pointing_event = true;
  protected _element?: HTMLElement;
  x: number;
  y: number;
  scene_x: number;
  scene_y: number;
  button: number;
  constructor(element: HTMLElement | undefined, event: PointerEvent | MouseEvent) {
    this._element = element;
    this.x = event.offsetX;
    this.y = event.offsetY;
    const { width = 1, height = 1 } = element?.getBoundingClientRect() || {};
    this.scene_x = (this.x / width) * 2 - 1;
    this.scene_y = -(this.y / height) * 2 + 1;
    this.button = event.button
  }
  init(element: HTMLElement, event: PointerEvent | MouseEvent) {
    this._element = element;
    this.x = event.offsetX;
    this.y = event.offsetY;
    const { width, height } = element.getBoundingClientRect();
    this.scene_x = (this.x / width) * 2 - 1;
    this.scene_y = -(this.y / height) * 2 + 1;
    this.button = event.button
  }
}
