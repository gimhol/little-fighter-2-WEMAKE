import type { IStagePhaseInfo } from "../defines";
import type { IDialogInfo } from "../defines/IDialogInfo";
import type { Stage } from "./Stage";

export interface IDialogState {
  index: number;
  list: IDialogInfo[]
}
export interface IReadonlyDialogState {
  readonly index: number;
  readonly list: Readonly<IDialogInfo[]>
}
export default interface IStageCallbacks {
  on_phase_changed?(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined,
  ): void;

  on_stage_finish?(stage: Stage): void;
  on_chapter_finish?(stage: Stage): void;
  on_requrie_goto_next_stage?(stage: Stage): void;
  on_dialogs_changed?(
    curr: IReadonlyDialogState,
    prev: IReadonlyDialogState,
    stage: Stage
  ): void;
}