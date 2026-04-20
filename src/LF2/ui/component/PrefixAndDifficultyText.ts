import { DifficultyNames } from "../../defines";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { IWorldDataset } from "../../IWorldDataset";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class PrefixAndDifficultyText extends UIComponent implements IWorldCallbacks {
  static override readonly TAG: string = "PrefixAndDifficultyText"
  private _text_loader = new UITextLoader(() => this.node).set_style({
    fill_style: "white",
    font: "12px Arial",
    line_width: 1,
    disposable: true
  })
  private _prefix: string = '';

  override on_start(): void {
    super.on_start?.();
    this._prefix = this.str(0) ?? '';
  }
  protected get text(): string {
    return `${this._prefix} (${DifficultyNames[this.world.difficulty]})`
  }
  override on_resume(): void {
    super.on_resume();
    this.world.callbacks.add(this)
    this.on_dataset_change('difficulty');
  }
  override on_pause(): void {
    super.on_pause();
    this.world.callbacks.del(this)
  }
  on_dataset_change<K extends keyof IWorldDataset>(key: K): void {
    if (key === 'difficulty') this._text_loader.set_text(this.text)
  }
}
