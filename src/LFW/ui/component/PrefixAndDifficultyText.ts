import { DifficultyNames } from "../../defines";
import { TextInfo } from "../../ditto/image/TextInfo";
import type { IWorldCallbacks } from "../../IWorldCallbacks";
import type { IWorldDataset } from "../../defines/IWorldDataset";
import { UIComponent } from "./UIComponent";

export class PrefixAndDifficultyText extends UIComponent implements IWorldCallbacks {
  static override readonly TAGS: string[] = ["PrefixAndDifficultyText"]
  private _prefix: string = '';
  private _style = {
    fill_style: "white",
    font: "12px Arial",
    line_width: 1,
    disposable: true
  };

  override on_start(): void {
    super.on_start?.();
    this._prefix = this.str(0) ?? '';
  }
  protected get text(): string {
    return `${this._prefix} (${DifficultyNames[this.world.difficulty]})`
  }
  override on_resume(): void {
    this.world.callbacks.add(this)
    this.on_dataset_change('difficulty');
  }
  override on_pause(): void {
    this.world.callbacks.del(this)
  }
  on_dataset_change<K extends keyof IWorldDataset>(key: K): void {
    if (key === 'difficulty') this.node.text = new TextInfo({ text: this.text, style: this._style })
  }
}
