import type { IUIEvent } from "./UIEvent";

export class LF2UIEvent implements IUIEvent {
  protected _stopped: number = 0;
  get stopped(): number { return this._stopped; }
  stop_propagation(): void {
    this._stopped = 1;
  }
  stop_immediate_propagation(): void {
    this._stopped = 2;
  }
}
