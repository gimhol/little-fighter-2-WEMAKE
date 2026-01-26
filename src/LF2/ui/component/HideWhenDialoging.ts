import { IDialogInfo } from "@/LF2/defines/IDialogInfo";
import { StageDialogListener } from "./StageDialogListener";
import { UIComponent } from "./UIComponent";

export class HideWhenDialoging extends UIComponent {
  static override readonly TAG: string = 'HideWhenDialoging';
  protected dialog_listener = new StageDialogListener(this, (d) => this.set_dialog(d));
  override on_start(): void {
    super.on_start?.();
    this.dialog_listener.start();
  }
  override on_stop(): void {
    super.on_stop?.();
    this.dialog_listener.stop();
  }
  set_dialog(d: IDialogInfo | undefined): void {
    this.node.visible = !d;
  }
}
