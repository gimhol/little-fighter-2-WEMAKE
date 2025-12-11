export enum ActionType {
  A_Sound = 'a_sound',
  A_NextFrame = 'a_next_frame',
  A_SetProp = 'a_set_prop',
  A_Defend = 'a_defend',
  A_BrokenDefend = 'a_broken_defend',

  V_Sound = 'v_sound',
  V_NextFrame = 'v_next_frame',
  V_SetProp = 'v_set_prop',
  V_Defend = 'v_defend',
  V_BrokenDefend = 'v_broken_defend',

  A_REBOUND_VX = 'a_rebound_vx',
  V_REBOUND_VX = 'v_rebound_vx',
  V_TURN_FACE = 'v_turn_face',
  V_TURN_TEAM = "v_turn_team",
  
  /** 合体 */
  FUSION = 'fusion'
}
