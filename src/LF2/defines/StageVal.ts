export enum StageVal {
  EnemiesCleared = "enemies_cleared",
  DialogCleared = "dialog_cleared",

  /** 当前阶段运行时长(以帧数计算…) */
  CurPhaseTime = "cur_phase_time",

  /** 当前对话框运行时长(以帧数计算…) */
  CurDialogTime = "cur_dialog_time",

  PressAttack = "press_attack",
  PressJump = "press_jump",
  PressDefend = "press_defend",
  PressUp = "press_up",
  PressDown = "press_down",
  PressLeft = "press_left",
  PressRight = "press_right",
  Broadcast = "broadcast",
}
export const S_Val = StageVal
export type S_Val = StageVal