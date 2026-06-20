export interface ISumInfo {
  /**
   * 胜利数
   */
  wins: number;
  /**
   * 战败数
   */
  loses: number;
  /** 
   * 击杀数 
   */
  kills: number;
  /** 
   * 伤害值 
   */
  damages: number;
  /** 受伤值 */
  hp_lost: number;
  /** 耗蓝量 */
  mp_usage: number;

  pickings: number;
  spawns: number;
  deads: number;
  team: string;

  /** 
   * 最后一个角色的死亡时间 
   */
  latest_dead_time: number;

  /**
   * 当前局是否已失败
   */
  lost: boolean;
}

