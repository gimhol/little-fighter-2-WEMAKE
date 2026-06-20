import type { ILFWCallback } from "../../ILFWCallback";
import { UIComponent } from "./UIComponent";

export class StageTransitions extends UIComponent implements ILFWCallback {
  static override readonly TAGS: string[] = ["StageTransitions"];
  override on_resume(): void {
    this.lfw.callbacks.add(this);
  }
  override on_pause(): void {
    this.lfw.callbacks.del(this);
  }
  on_enter_next_stage(): void {
  }
}
