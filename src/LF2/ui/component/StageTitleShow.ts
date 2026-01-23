import { Delay } from "../../animation";
import Easing from "../../animation/Easing";
import { Sequence } from "../../animation/Sequence";
import { Stage } from "../../stage/Stage";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class StageTitleShow extends UIComponent {
  static override readonly TAG = 'StageTitleShow';
  private _opactiy: Sequence = new Sequence(
    new Easing(0, 1).set_duration(500),
    new Delay(1)
      .set_duration(1500),
    new Easing(1, 0).set_duration(500),
  );
  private _txt_loader = new UITextLoader(() => this.node).set_style({
    fill_style: "white",
    font: `46px "Arial Black", Arial`,
    back_style: {
      font: `46px "Arial Black", Arial`,
      stroke_style: "#005A8E",
      line_width: 5
    }
  }).ignore_out_of_date();

  on_chapter_finish() {
    this.node.visible = false;
    this._txt_loader.set_text(["STAGE CLEAR!"])
    this._opactiy.start(false);
  }

  on_stage_change(stage: Stage, prev?: Stage) {
    prev?.callbacks.del(this)
    stage.callbacks.add(this)
    const title = this.lf2.string(stage.data.title ?? stage.bg.name ?? "")
    this.node.visible = false;
    this._txt_loader.set_text([title])
    this._opactiy.start(false);
  }

  override on_start(): void {
    super.on_start?.();
    this.on_stage_change(this.world.stage)
  }

  override on_resume(): void {
    super.on_resume();
    this.world.callbacks.add(this)
  }

  override on_pause(): void {
    super.on_pause();
    this.world.callbacks.del(this)
  }

  override update(dt: number): void {
    this._opactiy.update(dt);
    this.node.opacity = this._opactiy.value
  }
}