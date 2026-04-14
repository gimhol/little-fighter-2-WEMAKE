import {
  FrameBehavior,
  IFrameInfo
} from "../defines";
import { make_fb_bat_chase } from "./frame_behavior/make_fb_bat_chase";
import { make_fb_bat_chase_start } from "./frame_behavior/make_fb_bat_chase_start";
import { make_fb_boomerang } from "./frame_behavior/make_fb_boomerang";
import { make_fb_chasing_same_enemy } from "./frame_behavior/make_fb_chasing_same_enemy";
import { make_fb_dennis_chase } from "./frame_behavior/make_fb_dennis_chase";
import { make_fb_firzen_disater_start } from "./frame_behavior/make_fb_firzen_disater_start";
import { make_fb_firzen_volcano_start } from "./frame_behavior/make_fb_firzen_volcano_start";
import { make_fb_jan_angle_blessing } from "./frame_behavior/make_fb_jan_angle_blessing";
import { make_fb_jan_chase_start } from "./frame_behavior/make_fb_jan_chase_start";
import { make_fb_jan_chaseh_start } from "./frame_behavior/make_fb_jan_chaseh_start";
import { make_fb_john_chase } from "./frame_behavior/make_fb_john_chase";
import { make_fb_john_chase_leaving } from "./frame_behavior/make_fb_john_chase_leaving";
import { make_fb_julian_ball } from "./frame_behavior/make_fb_julian_ball";
import { make_fb_julian_ball_start } from "./frame_behavior/make_fb_julian_ball_start";

export function make_frame_behavior(frame: IFrameInfo, oid: string) {
  switch (frame.behavior as FrameBehavior) {
    case FrameBehavior.AngelBlessing:
      make_fb_jan_angle_blessing(frame);
      break;
    case FrameBehavior.JohnChase:
      make_fb_john_chase(frame);
      break;
    case FrameBehavior.DennisChase:
      make_fb_dennis_chase(frame);
      break;
    case FrameBehavior.Boomerang:
      make_fb_boomerang(frame);
      break;
    case FrameBehavior.AngelBlessingStart:
      make_fb_jan_chaseh_start(frame);
      break;
    case FrameBehavior.DevilJudgementStart:
      make_fb_jan_chase_start(frame);
      break;
    case FrameBehavior.ChasingSameEnemy:
      make_fb_chasing_same_enemy(frame, oid);
      break;
    case FrameBehavior.BatStart:
      make_fb_bat_chase_start(frame);
      break;
    case FrameBehavior.FirzenDisasterStart:
      make_fb_firzen_disater_start(frame);
      break;
    case FrameBehavior.JohnBiscuitLeaving:
      make_fb_john_chase_leaving(frame);
      break;
    case FrameBehavior.FirzenVolcanoStart:
      make_fb_firzen_volcano_start(frame, frame.centerx, -79);
      break;
    case FrameBehavior.Bat:
      make_fb_bat_chase(frame);
      break;
    case FrameBehavior.JulianBallStart:
      make_fb_julian_ball_start(frame);
      break;
    case FrameBehavior.JulianBall: {
      make_fb_julian_ball(frame);
      break;
    }
  }
}

