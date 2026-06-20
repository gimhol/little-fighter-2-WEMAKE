import type { IOpointInfo } from "./IOpointInfo";
export type __KEEP__ = IOpointInfo

/**
 * 数量生成控制
 * 
 * @see {IOpointInfo.multi}
 */
export enum OpointMultiEnum {
  /** 
   * 根据敌人数量生成
   * @see {IOpointInfo.multi}
   */
  AccordingEnemies = 0,

  /**
   * 根据队友数量生成
   * @see {IOpointInfo.multi}
   */
  AccordingAllies = 1,
}
