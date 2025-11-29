import { ILf2Callback } from "../../ILf2Callback";
import { UIComponent } from "./UIComponent";

export class StageTransitions extends UIComponent implements ILf2Callback {
  static override readonly TAG = 'StageTransitions'
  override on_resume(): void {
    super.on_resume();
    this.lf2.callbacks.add(this);
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }
  on_enter_next_stage(): void {
    alert("!");
  }
}
