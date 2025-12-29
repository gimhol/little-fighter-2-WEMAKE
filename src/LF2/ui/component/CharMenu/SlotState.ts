import { type IEntityData, TeamEnum } from "@/LF2/defines";
import { SlotStep } from "./SlotStep";

export class SlotState {
  fighter: IEntityData | null = null;
  random: boolean = true;
  step: number = SlotStep.FighterSel;
  team: string = TeamEnum.Independent;
}
