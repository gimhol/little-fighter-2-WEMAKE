export enum ActionType {
  /** '攻方'发出声音 */
  A_Sound = 'a_sound',
  /** 修改'攻方'下一帧 */
  A_NextFrame = 'a_next_frame',
  A_SetProp = 'a_set_prop',
  /** 被'受方'防御时，修改'攻方'下一帧 */
  A_Defend = 'a_defend',
  /** '受方'破防时，修改'攻方'下一帧 */
  A_BrokenDefend = 'a_broken_defend',

  /** '受方'发出声音 */
  V_Sound = 'v_sound',
  /** 修改'受方'下一帧 */
  V_NextFrame = 'v_next_frame',
  V_SetProp = 'v_set_prop',
  /** 被'受方'防御时，修改'受方'下一帧 */
  V_Defend = 'v_defend',
  /** '受方'破防时，修改'受方'下一帧 */
  V_BrokenDefend = 'v_broken_defend',

  /** 反转'攻方'的X轴速度 */
  A_REBOUND_VX = 'a_rebound_vx',

  /** 反转'受方'的X轴速度 */
  V_REBOUND_VX = 'v_rebound_vx',

  /** '受方'转身 */
  V_TURN_FACE = 'v_turn_face',

  /** '受方'加入'攻方'队伍 */
  V_TURN_TEAM = "v_turn_team",

  /** 合体 */
  FUSION = 'fusion',

  /** 广播 */
  BROADCAST = 'broadcast'
}
