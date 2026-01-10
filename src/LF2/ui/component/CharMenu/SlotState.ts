import { type IEntityData, TeamEnum } from "@/LF2/defines";
import { SlotStep } from "./SlotStep";

export interface ISlotState {
  fighter: IEntityData | null;
  random: boolean;
  step: number;
  team: string;
}
export class SlotState {
  fighter: IEntityData | null = null;
  random: boolean = true;
  step: number = SlotStep.FighterSel;
  team: string = TeamEnum.Independent;
  constructor(o: Partial<ISlotState>) {
    Object.assign(this, o)
  }
}
