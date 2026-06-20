import type { ISumInfo } from "./ISumInfo";

export interface ITeamSumInfo extends ISumInfo {
  /**
   * 当前存活数
   */
  lives: number;

  /**
   * 当前血量
   */
  hp: number;

  /** 
   * 当前候补人员数 
   */
  reserve: number;
}
