import { fields, int } from "../fields";
import { Defines } from "./defines";

export interface IBotDataSet {
  /** 走攻触发范围X(敌人正对) */
  w_atk_f_x?: number; // = Defines.AI_W_ATK_F_X;

  /** 走攻触发范围X(敌人背对) */
  w_atk_b_x?: number; // = Defines.AI_W_ATK_B_X;

  /** 走攻触发最小范围X */
  w_atk_m_x?: number; // = Defines.AI_W_ATK_M_X;

  /** 走攻触发范围Z */
  w_atk_z?: number; // = Defines.AI_W_ATK_Z;


  /** 跑攻欲望值 */
  r_atk_desire?: number; // = Defines.AI_R_ATK_DESIRE;

  /** 跑攻触发范围X(敌人正对) */
  r_atk_f_x?: number; // = Defines.AI_R_ATK_F_X;

  /** 跑攻触发范围X(敌人背对) */
  r_atk_b_x?: number; // = Defines.AI_R_ATK_F_X;

  /** 跑攻触发范围Z */
  r_atk_z?: number; // = Defines.AI_R_ATK_Z;


  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_f_x?: number; // = Defines.AI_D_ATK_F_X;

  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_b_x?: number; // = Defines.AI_D_ATK_B_X;

  /** 冲跳攻触发范围Z */
  d_atk_z?: number; // = Defines.AI_D_ATK_Z;


  /** 跳攻触发范围X(敌人正对) */
  j_atk_f_x?: number; // = Defines.AI_D_ATK_F_X;

  /** 跳攻触发范围X(敌人正对) */
  j_atk_b_x?: number; // = Defines.AI_D_ATK_B_X;

  /** 跳攻触发范围Z */
  j_atk_z?: number; // = Defines.AI_D_ATK_Z;

  /** 跳攻触发范围Y */
  j_atk_y_min?: number; // = Defines.AI_D_ATK_Y_MIN;
  j_atk_y_max?: number; // = Defines.AI_D_ATK_Y_MAX;

  jump_desire?: number; // = Defines.AI_J_DESIRE;
  dash_desire?: number; // = Defines.AI_D_DESIRE;


  /** 最小欲望值：跑步 */
  r_desire_min?: number; // = Defines.AI_R_DESIRE_MIN;

  /** 最大欲望值：跑步 */
  r_desire_max?: number; // = Defines.AI_R_DESIRE_MAX;

  /** 最小起跑范围X */
  r_x_min?: number; // = Defines.AI_R_X_MIN;

  /** 最大起跑范围X */
  r_x_max?: number; // = Defines.AI_R_X_MAX;

  /** 欲望值：停止跑步 */
  r_stop_desire?: number; // = Defines.AI_R_STOP_DESIRE;

  /** 
   * 欲望值：防御 
   * [0, 10000]
   */
  d_desire?: number;
}

export class BotDataSet implements Required<IBotDataSet> {
  static Default: BotDataSet = new BotDataSet();
  /** 欲望值：停止跑步 */
  r_stop_desire = Defines.AI_R_STOP_DESIRE;
  /** 欲望值: 防御 */
  d_desire = Defines.AI_DEF_DESIRE;
  /** 走攻触发范围X(敌人正对) */
  w_atk_f_x = Defines.AI_W_ATK_F_X;
  /** 走攻触发范围X(敌人背对) */
  w_atk_b_x = Defines.AI_W_ATK_B_X;
  /** 走攻盲区 */
  w_atk_m_x = Defines.AI_W_ATK_M_X;
  /** 走攻触发范围Z */
  w_atk_z = Defines.AI_W_ATK_Z;
  /** 跑攻欲望值 */
  r_atk_desire = Defines.AI_R_ATK_DESIRE;
  /** 跑攻触发范围X(敌人正对) */
  r_atk_f_x = Defines.AI_R_ATK_F_X;
  /** 跑攻触发范围X(敌人背对) */
  r_atk_b_x = Defines.AI_R_ATK_F_X;
  /** 跑攻触发范围Z */
  r_atk_z = Defines.AI_R_ATK_Z;
  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_f_x = Defines.AI_D_ATK_F_X;
  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_b_x = Defines.AI_D_ATK_B_X;
  /** 冲跳攻触发范围Z */
  d_atk_z = Defines.AI_D_ATK_Z;
  /** 跳攻触发范围X(敌人正对) */
  j_atk_f_x = Defines.AI_J_ATK_F_X;
  /** 跳攻触发范围X(敌人正对) */
  j_atk_b_x = Defines.AI_J_ATK_B_X;
  /** 跳攻触发范围Z */
  j_atk_z = Defines.AI_J_ATK_Z;
  /** 跳攻触发范围Y */
  j_atk_y_min = Defines.AI_J_ATK_Y_MIN;
  j_atk_y_max = Defines.AI_J_ATK_Y_MAX;
  /** 跳越欲望 */
  jump_desire = Defines.AI_J_DESIRE;
  /** 冲刺欲望 */
  dash_desire = Defines.AI_D_DESIRE;
  /** 最小欲望值：跑步 */
  r_desire_min = Defines.AI_R_DESIRE_MIN;
  /** 最大欲望值：跑步 */
  r_desire_max = Defines.AI_R_DESIRE_MAX;
  /** 
   * 最小起跑范围X 
   * 距离敌人小于于等于此距离时，此时奔跑欲望值最小
   */
  r_x_min = Defines.AI_R_X_MIN;

  /** 
   * 最大起跑范围X 
   * 距离敌人大于等于此距离时，此时奔跑欲望值最大
   */
  r_x_max = Defines.AI_R_X_MAX;

}

export const bot_dataset_fields = fields<IBotDataSet>({
  w_atk_f_x: int,
  w_atk_b_x: int,
  w_atk_m_x: int,
  w_atk_z: int,
  r_atk_desire: int,
  r_atk_f_x: int,
  r_atk_b_x: int,
  r_atk_z: int,
  d_atk_f_x: int,
  d_atk_b_x: int,
  d_atk_z: int,
  j_atk_f_x: int,
  j_atk_b_x: int,
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