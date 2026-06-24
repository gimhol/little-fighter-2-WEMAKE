import { Defines } from "../../defines/defines";
import type { IWorldCallbacks } from "../../IWorldCallbacks";
import type { IWorldDataset } from "../../defines/IWorldDataset";
import { Label } from "./Label";

export class DifficultyText extends Label implements IWorldCallbacks {
  static override readonly TAGS: string[] = ["DifficultyText", "difficulty_text"];
  override on_resume(): void {
    this.world.callbacks.add(this);
    this.on_dataset_change('difficulty');
  }
  override on_pause(): void {
    this.world.callbacks.del(this);
  }
  on_dataset_change<K extends keyof IWorldDataset>(key: K): void {
    if (key !== 'difficulty') return;
    this.text = this.lfw.string(Defines.DifficultyLabels[this.world.difficulty]);
  }
}
