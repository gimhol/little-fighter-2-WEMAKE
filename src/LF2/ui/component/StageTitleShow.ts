import { Delay } from "../../animation";
import Easing from "../../animation/Easing";
import { Sequence } from "../../animation/Sequence";
import { Stage } from "../../stage/Stage";
import { UITextLoader } from "../UITextLoader";
import { Label } from "./Label";

export class StageTitleShow extends Label {
  static override readonly TAGS: string[] = ["StageTitleShow"];
  private _opactiy: Sequence = new Sequence(
    new Easing(0, 1).set_duration(500),
    new Delay(1).set_duration(1500),
    new Easing(1, 0).set_duration(500),
  );

  override set_text(text: string): this {
    super.set_text(text);
    this._opactiy.start(false);
    return this;
  }
  on_chapter_finish() {
    this.set_text("STAGE CLEAR!")
  }
  on_stage_change(stage: Stage, prev?: Stage) {
    prev?.callbacks.del(this)
    stage.callbacks.add(this)
    const title = this.lf2.string(stage.data.title ?? stage.bg.name ?? "")
    this.set_text(title)
  }

  override on_start(): void {
    super.on_start?.();
    this.world.callbacks.add(this)
    this.on_stage_change(this.world.stage)
  }

  override on_stop(): void {
    super.on_stop?.();
    this.world.callbacks.del(this)
  }

  override update(dt: number): void {
    this._opactiy.update(dt);
    this.node.opacity = this._opactiy.value
  }
}