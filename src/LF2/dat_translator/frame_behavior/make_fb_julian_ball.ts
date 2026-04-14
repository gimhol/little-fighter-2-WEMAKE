import { ChaseLost } from "../../defines/ChaseLost";
import { Defines as D } from "../../defines/defines";
import { FacingFlag as FF } from "../../defines/FacingFlag";
import { HitFlag } from "../../defines/HitFlag";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { SpeedMode } from "../../defines/SpeedMode";
import { hp_gt_0 } from "../conditions/hp_gt_0";

export function make_fb_julian_ball(frame: IFrameInfo) {
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
  const fid = Number(frame.id);
  frame.chase = { flag: HitFlag.EnemyFighter, lost: ChaseLost.Hover };
  if (fid >= 50 && fid <= 59) {
    frame.key_down = { 'F': { id: '' + (fid - 50), wait: 'i', expression: hp_gt_0 } };
  } else if (fid >= 1 && fid <= 9) {
    frame.key_down = { 'B': { id: '' + (fid + 50), wait: 'i', expression: hp_gt_0 } };
  }
}
