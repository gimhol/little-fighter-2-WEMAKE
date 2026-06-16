/**
 * enter_frame() 的返回值，反映内部分支情况。
 */

export const enum EnterFrameResult {
  /** 实体已消失（frame === Gone），未执行任何操作 */
  Gone = 0,
  /** 未找到目标帧（get_next_frame 返回空 / judger 不通过 / mp或hp 不足） */
  NotFound = 1,
  /** 成功进入目标帧 */
  Entered = 2,
  /** 目标帧不存在，回退到自动帧（仅在首次初始化时：frame === EMPTY_FRAME_INFO） */
  Fallback = 3
}
