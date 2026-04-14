import { ChaseLost } from "../../defines/ChaseLost";
import { HitFlag } from "../../defines/HitFlag";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { SpeedMode } from "../../defines/SpeedMode";
export function make_fb_boomerang(frame: IFrameInfo) {
  frame.dvx = 20;
  frame.acc_x = 0.25;
  frame.vxm = SpeedMode.AccTo;
  frame.dvz = 1.8;
  frame.acc_z = 0.1;
  frame.vzm = SpeedMode.AccTo;
  frame.dvy = -0.4;
  frame.acc_y = 0.125;
  frame.vym = SpeedMode.AccTo;
  frame.ctrl_x = frame.ctrl_y = frame.ctrl_z = 1;
  frame.chase = { flag: HitFlag.EnemyFighter, lost: ChaseLost.Leave };
}
