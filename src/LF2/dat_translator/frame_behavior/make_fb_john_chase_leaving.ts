import { FacingFlag as FF } from "../../defines/FacingFlag";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { SpeedMode } from "../../defines/SpeedMode";

export function make_fb_john_chase_leaving(frame: IFrameInfo) {
  frame.facing = FF.VX;
  frame.dvx = 30;
  frame.acc_x = 2;
  frame.vxm = SpeedMode.AccTo;
}
