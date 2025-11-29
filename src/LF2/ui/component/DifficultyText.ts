import { Defines } from "../../defines/defines";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { IWorldDataset } from "../../IWorldDataset";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class DifficultyText extends UIComponent implements IWorldCallbacks {
  static override readonly TAG: string = "difficulty_text";
  private _text_loader = new UITextLoader(() => this.node).set_style({
    fill_style: "#9b9bff",
    font: "15px Arial",
  }).ignore_out_of_date();

  protected get text(): string {
    return this.lf2.string(Defines.DifficultyLabels[this.world.difficulty]);
  }
  override on_resume(): void {
    super.on_resume();
    this.world.callbacks.add(this);
    this.on_dataset_change('difficulty');
  }
  override on_pause(): void {
    super.on_pause();
    this.world.callbacks.del(this);
  }
  on_dataset_change<K extends keyof IWorldDataset>(key: K): void {
    if (key === 'difficulty') this._text_loader.set_text([this.text])
  }
}
