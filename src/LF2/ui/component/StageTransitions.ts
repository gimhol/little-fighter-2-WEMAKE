import { ILf2Callback } from "../../ILf2Callback";
import { UIComponent } from "./UIComponent";

export class StageTransitions extends UIComponent implements ILf2Callback {
  static override readonly TAGS: string[] = ["StageTransitions"];
  override on_resume(): void {
    this.lf2.callbacks.add(this);
  }
  override on_pause(): void {
    this.lf2.callbacks.del(this);
  }
  on_enter_next_stage(): void {
    alert("!");
  }
}
