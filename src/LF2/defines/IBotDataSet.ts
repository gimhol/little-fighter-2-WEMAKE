import { fields, int } from "../fields";

export interface IBotDataSet {
  /** 走攻触发范围X(敌人正对) */
  w_atk_x?: number;

  /** 
   * 走攻触发最小范围X 
   * 当目标过近时，应拉开距离
   */
  w_atk_m_x?: number;
    
  /** 
   * 走攻触发最小范围X 
   * 当目标过近时，应拉开距离
   */
  w_atk_r_x?: number;

  /** 走攻触发范围Z */
  w_atk_z?: number;

  /** 跑攻欲望值 */
  r_atk_desire?: number;

  /** 跑攻触发范围X(敌人正对) */
  r_atk_x?: number;


  /** 跑攻触发范围Z */
  r_atk_z?: number;

  /** 冲跳攻触发范围X */
  d_atk_x?: number;

  /** 冲跳攻触发范围Z */
  d_atk_z?: number;

  /** 跳攻触发范围X(敌人正对) */
  j_atk_x?: number;

  /** 跳攻触发范围Z */
  j_atk_z?: number;

  /** 跳攻触发范围Y */
  j_atk_y_min?: number;
  j_atk_y_max?: number;

  jump_desire?: number;
  dash_desire?: number;


  /** 最小欲望值：跑步 */
  r_desire_min?: number;

  /** 最大欲望值：跑步 */
  r_desire_max?: number;

  /** 最小起跑范围X */
  r_x_min?: number;

  /** 最大起跑范围X */
  r_x_max?: number;

  /** 欲望值：停止跑步 */
  r_stop_desire?: number;

  /** 
   * 欲望值：防御 
   * [0, 10000]
   */
  d_desire?: number;
}

export class BotDataSet implements Required<IBotDataSet> {
  static Default: BotDataSet = new BotDataSet();
  /** 欲望值：停止跑步 */
  r_stop_desire = 10;
  /** 欲望值: 防御 */
  d_desire = 150;
  /** 走攻触发范围X(敌人正对) */
  w_atk_x = 50;
  /** 走攻触发范围X(敌人背对) */
  w_atk_b_x = 40;
  /** 走攻盲区 */
  w_atk_m_x = -1;
  w_atk_r_x = -1;
  /** 走攻触发范围Z */
  w_atk_z = 15;
  /** 跑攻欲望值 */
  r_atk_desire = 10000;
  /** 跑攻触发范围X(敌人正对) */
  r_atk_x = 100;
  /** 跑攻触发范围Z */
  r_atk_z = 15;
  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_x = 200;
  /** 冲跳攻触发范围Z */
  d_atk_z = 60;
  /** 跳攻触发范围X(敌人正对) */
  j_atk_x = 80;
  /** 跳攻触发范围Z */
  j_atk_z = 60;
  /** 跳攻触发范围Y */
  j_atk_y_min = -160;
  j_atk_y_max = 160;
  /** 跳越欲望 */
  jump_desire = 50;
  /** 冲刺欲望 */
  dash_desire = 100;
  /** 最小欲望值：跑步 */
  r_desire_min = 0;
  /** 最大欲望值：跑步 */
  r_desire_max = 500;
  /** 
   * 最小起跑范围X 
   * 距离敌人小于于等于此距离时，此时奔跑欲望值最小
   */
  r_x_min = 100;

  /** 
   * 最大起跑范围X 
   * 距离敌人大于等于此距离时，此时奔跑欲望值最大
   */
  r_x_max = 2000;

}

export const bot_dataset_fields = fields<IBotDataSet>({
  w_atk_x: int,
  w_atk_m_x: int,
  w_atk_r_x: int,
  w_atk_z: int,
  r_atk_desire: int,
  r_atk_x: int,
  r_atk_z: int,
  d_atk_x: int,
  d_atk_z: int,
  j_atk_x: int,
  j_atk_z: int,
  j_atk_y_min: int,
  j_atk_y_max: int,
  jump_desire: int,
  dash_desire: int,
  r_desire_min: int,
  r_desire_max: int,
  r_x_min: int,
  r_x_max: int,
  r_stop_desire: int,
  d_desire: int,
})