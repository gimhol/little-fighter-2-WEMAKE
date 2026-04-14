import { ChaseLost } from "../../defines/ChaseLost";
import { Defines as D } from "../../defines/defines";
import { FacingFlag as FF } from "../../defines/FacingFlag";
import { HitFlag } from "../../defines/HitFlag";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { SpeedMode } from "../../defines/SpeedMode";
import { hp_gt_0 } from "../conditions/hp_gt_0";

export function make_fb_dennis_chase(frame: IFrameInfo) {
  frame.facing = FF.VX;
  frame.dvx = 14;
  frame.acc_x = 0.25;
  frame.vxm = SpeedMode.AccTo;

  frame.dvz = D.DEFAULT_OPOINT_SPEED_Z;
  frame.acc_z = 0.125;
  frame.vzm = SpeedMode.AccTo;

  frame.dvy = -0.5;
  frame.acc_y = 0.125;
  frame.vym = SpeedMode.AccTo;

  frame.ctrl_x = frame.ctrl_y = frame.ctrl_z = 1;
  frame.on_dead = { id: '5' };
  switch (frame.id) {
    case '1': frame.key_down = { 'F': { id: '3', wait: 'i', expression: hp_gt_0 } }; break;
    case '2': frame.key_down = { 'F': { id: '4', wait: 'i', expression: hp_gt_0 } }; break;
    case '3': frame.key_down = { 'B': { id: '1', wait: 'i', expression: hp_gt_0 } }; break;
    case '4': frame.key_down = { 'B': { id: '2', wait: 'i', expression: hp_gt_0 } }; break;
  }
  frame.chase = { flag: HitFlag.EnemyFighter, lost: ChaseLost.Hover, oy: 0.5 };
}
