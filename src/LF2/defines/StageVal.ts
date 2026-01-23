export enum StageVal {
  EnemiesCleared = "enemies_cleared",
  DialogCleared = "dialog_cleared",

  /** 当前阶段运行时长(以帧数计算…) */
  CurPhaseTime = "cur_phase_time",

  /** 当前对话框运行时长(以帧数计算…) */
  CurDialogTime = "cur_dialog_time",
}
export const S_Val = StageVal
export type S_Val = StageVal