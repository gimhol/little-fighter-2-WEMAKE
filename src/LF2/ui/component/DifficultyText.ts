import { Defines } from "../../defines/defines";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { IWorldDataset } from "../../IWorldDataset";
import { Label } from "./Label";

export class DifficultyText extends Label implements IWorldCallbacks {
  static override readonly TAGS: string[] = ["DifficultyText", "difficulty_text"];
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
    if (key !== 'difficulty') return;
    this.text = this.lf2.string(Defines.DifficultyLabels[this.world.difficulty]);
  }
}
