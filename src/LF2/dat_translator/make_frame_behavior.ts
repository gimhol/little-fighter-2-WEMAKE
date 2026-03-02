import {
  ActionType,
  BuiltIn_OID,
  CollisionVal as C_Val,
  Defines,
  EntityVal,
  FacingFlag as FF,
  FrameBehavior,
  HitFlag,
  IDatIndex,
  IFrameInfo,
  ItrKind,
  OpointKind, OpointMultiEnum, OpointSpreading,
  SpeedMode
} from "../defines";
import { ChaseLost } from "../defines/ChaseLost";
import { ensure } from "../utils";
import { CondMaker } from "./CondMaker";
import { firzen_disater_start } from "./firzen_disater_start";
import { jan_chase_start } from "./jan_chase_start";
import { jan_chaseh_start } from "./jan_chaseh_start";
import { take } from "./take";

const hp_gt_0 = new CondMaker<EntityVal>().and(EntityVal.HP, '>', 0).done()
export function make_frame_behavior(frame: IFrameInfo, datIndex: IDatIndex) {
  const hit_Fa = take(frame, "hit_Fa");
  if (hit_Fa) {
    frame.behavior = hit_Fa;
    (frame as any).behavior_name = `FrameBehavior.` + FrameBehavior[hit_Fa];
  }
  switch (hit_Fa as FrameBehavior) {
    case FrameBehavior.AngelBlessing:
      frame.facing = FF.VX;
      frame.dvx = Defines.ANGEL_BLESSING_MAX_VX;
      frame.acc_x = Defines.ANGEL_BLESSING_ACC_X;
      frame.vxm = SpeedMode.AccTo;
      frame.dvz = Defines.DEFAULT_OPOINT_SPEED_Z;
      frame.acc_z = Defines.ANGEL_BLESSING_ACC_Z;
      frame.vzm = SpeedMode.AccTo;
      frame.dvy = Defines.ANGEL_BLESSING_MAX_VY;
      frame.acc_y = Defines.ANGEL_BLESSING_ACC_Y;
      frame.vym = SpeedMode.AccTo;
      frame.ctrl_x = frame.ctrl_y = frame.ctrl_z = 1;
      frame.itr = ensure(frame.itr, {
        kind: ItrKind.Heal,
        x: 25,
        y: 13,
        w: 32,
        h: 34,
        injury: 100,
        hit_flag: HitFlag.AllyFighter,
        l: 24,
        z: -12,
        actions: [
          {
            type: ActionType.A_NextFrame,
            data: {
              id: "60"
            }
          }
        ],
        test: new CondMaker().and(C_Val.VictimIsChasing, "==", 1).done()
      });
      frame.chase = { flag: HitFlag.AllyFighter, lost: ChaseLost.Leave | ChaseLost.End };
      break;
    case FrameBehavior.JohnChase:
      frame.facing = FF.VX;
      frame.dvx = Defines.JOHN_CHASE_MAX_VX;
      frame.acc_x = Defines.JOHN_CHASE_ACC_X;
      frame.vxm = SpeedMode.AccTo;
      frame.dvz = Defines.DEFAULT_OPOINT_SPEED_Z;
      frame.acc_z = Defines.JOHN_CHASE_ACC_Z;
      frame.vzm = SpeedMode.AccTo;
      frame.dvy = Defines.JOHN_CHASE_MAX_VY;
      frame.acc_y = Defines.JOHN_CHASE_ACC_Y;
      frame.vym = SpeedMode.AccTo;
      frame.ctrl_x = frame.ctrl_y = frame.ctrl_z = 1;
      frame.chase = { flag: HitFlag.EnemyFighter, lost: ChaseLost.Hover, oy: 0.5 };
      break;
    case FrameBehavior.DennisChase: {
      frame.facing = FF.VX;
      frame.dvx = Defines.DENNIS_CHASE_MAX_VX;
      frame.acc_x = Defines.DENNIS_CHASE_ACC_X;
      frame.vxm = SpeedMode.AccTo;

      frame.dvz = Defines.DEFAULT_OPOINT_SPEED_Z;
      frame.acc_z = Defines.DENNIS_CHASE_ACC_Z;
      frame.vzm = SpeedMode.AccTo;

      frame.dvy = Defines.DENNIS_CHASE_MAX_VY;
      frame.acc_y = Defines.DENNIS_CHASE_ACC_Y;
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
      break;
    }
    case FrameBehavior.Boomerang:
      frame.dvx = Defines.BOOMERANG_CHASE_MAX_VX;
      frame.acc_x = Defines.BOOMERANG_CHASE_ACC_X;
      frame.vxm = SpeedMode.AccTo;

      frame.dvz = Defines.BOOMERANG_CHASE_MAX_VZ;
      frame.acc_z = Defines.BOOMERANG_CHASE_ACC_Z;
      frame.vzm = SpeedMode.AccTo;

      frame.dvy = Defines.BOOMERANG_CHASE_MAX_VY;
      frame.acc_y = Defines.BOOMERANG_CHASE_ACC_Y;
      frame.vym = SpeedMode.AccTo;

      frame.ctrl_x = frame.ctrl_y = frame.ctrl_z = 1;
      frame.chase = { flag: HitFlag.EnemyFighter, lost: ChaseLost.Leave };
      break;
    case FrameBehavior.AngelBlessingStart:
      jan_chaseh_start(frame);
      break;
    case FrameBehavior.DevilJudgementStart:
      jan_chase_start(frame);
      break;
    case FrameBehavior.ChasingSameEnemy:
      frame.facing = FF.VX;
      frame.dvx = Defines.DISATER_CHASE_MAX_VX;
      frame.acc_x = Defines.DISATER_CHASE_ACC_X;
      frame.vxm = SpeedMode.AccTo;
      frame.dvz = Defines.DEFAULT_OPOINT_SPEED_Z;
      frame.acc_z = Defines.DISATER_CHASE_ACC_Z;
      frame.vzm = SpeedMode.AccTo;
      frame.dvy = Defines.DISATER_CHASE_MAX_VY;
      frame.acc_y = Defines.DISATER_CHASE_ACC_Y;
      frame.vym = SpeedMode.AccTo;
      frame.ctrl_x = frame.ctrl_z = 1;
      frame.itr?.forEach(itr => {
        switch (datIndex.id) {
          case BuiltIn_OID.FirzenChasef:
          case BuiltIn_OID.FirzenChasei:
            itr.on_hit_ground = { id: "60" };
            break;
          default:
            itr.on_hit_ground = { id: "10" };
            break;
        }
      })
      frame.chase = {
        flag: HitFlag.EnemyFighter,
        lost: ChaseLost.Hover | ChaseLost.End
      };
      break;
    case FrameBehavior.BatStart:
      frame.opoint = ensure(frame.opoint, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.BatChase,
        x: frame.centerx,
        y: frame.centery,
        action: { id: "0" },
        multi: {
          type: OpointMultiEnum.AccordingEnemies,
          min: 3,
        },
        spreading: OpointSpreading.Bat,
      });
      break;
    case FrameBehavior.FirzenDisasterStart:
      firzen_disater_start(frame);
      break;
    case FrameBehavior.JohnBiscuitLeaving:
      frame.facing = FF.VX;
      frame.dvx = 15;
      frame.acc_x = 2;
      frame.vxm = SpeedMode.AccTo;
      break;
    case FrameBehavior.FirzenVolcanoStart:
      firzen_disater_start(frame, frame.centerx, -79);
      frame.opoint = ensure(frame.opoint, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx,
        y: 24,
        action: { id: "109" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FreezeColumn,
        x: 135,
        y: 24,
        action: { id: "100" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FreezeColumn,
        x: 135,
        y: 24,
        z: -60,
        dvz: -4,
        action: { id: "100" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FreezeColumn,
        x: 135,
        y: 24,
        z: 60,
        dvz: 4,
        action: { id: "100" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FreezeColumn,
        x: -45,
        y: 24,
        action: { id: "100", facing: FF.Backward },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FreezeColumn,
        x: -45,
        y: 24,
        z: -60,
        dvz: -4,
        action: { id: "100", facing: FF.Backward },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FreezeColumn,
        x: -45,
        y: 24,
        z: 60,
        dvz: 4,
        action: { id: "100", facing: FF.Backward },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx,
        y: 26,
        z: 0,
        action: { id: "54" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx - 25,
        y: 26,
        z: 0,
        action: { id: "54" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx + 25,
        y: 26,
        z: 0,
        action: { id: "54", facing: 2 },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx - 50,
        y: 26,
        z: 0,
        action: { id: "54" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx + 50,
        y: 26,
        z: 0,
        action: { id: "54", facing: 2 },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx - 38,
        y: 26,
        z: -15,
        action: { id: "54" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx + 38,
        y: 26,
        z: -15,
        action: { id: "54", facing: 2 },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx - 38,
        y: 26,
        z: 15,
        action: { id: "54" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx + 38,
        y: 26,
        z: 15,
        action: { id: "54", facing: 2 },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx + 10,
        y: 26,
        z: 25,
        action: { id: "54" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx - 10,
        y: 26,
        z: 25,
        action: { id: "54", facing: 2 },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx + 10,
        y: 26,
        z: -25,
        action: { id: "54" },
      }, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.FirenFlame,
        x: frame.centerx - 10,
        y: 26,
        z: -25,
        action: { id: "54", facing: 2 },
      });
      break;
    case FrameBehavior.Bat:
      frame.facing = FF.VX;
      frame.dvx = Defines.BAT_CHASE_MAX_VX;
      frame.acc_x = Defines.BAT_CHASE_ACC_X;
      frame.vxm = SpeedMode.AccTo;
      frame.dvz = Defines.DEFAULT_OPOINT_SPEED_Z;
      frame.acc_z = Defines.BAT_CHASE_ACC_Z;
      frame.vzm = SpeedMode.AccTo;
      frame.dvy = Defines.BAT_CHASE_MAX_VY;
      frame.acc_y = Defines.BAT_CHASE_ACC_Y;
      frame.vym = SpeedMode.AccTo;
      frame.ctrl_x = frame.ctrl_y = frame.ctrl_z = 1;
      frame.chase = { flag: HitFlag.EnemyFighter, lost: ChaseLost.Hover };
      break;
    case FrameBehavior.JulianBallStart:
      frame.opoint = ensure(frame.opoint, {
        kind: OpointKind.Normal,
        oid: BuiltIn_OID.JulianBall,
        x: frame.centerx,
        y: frame.centery,
        dvx: 8,
        action: { id: "50" },
      });
      break;
    case FrameBehavior.JulianBall: {
      frame.facing = FF.VX;
      frame.dvx = Defines.DENNIS_CHASE_MAX_VX;
      frame.acc_x = Defines.DENNIS_CHASE_ACC_X;
      frame.vxm = SpeedMode.AccTo;
      frame.dvz = Defines.DEFAULT_OPOINT_SPEED_Z;
      frame.acc_z = Defines.DENNIS_CHASE_ACC_Z;
      frame.vzm = SpeedMode.AccTo;
      frame.dvy = Defines.DENNIS_CHASE_MAX_VY;
      frame.acc_y = Defines.DENNIS_CHASE_ACC_Y;
      frame.vym = SpeedMode.AccTo;
      frame.ctrl_x = frame.ctrl_y = frame.ctrl_z = 1;
      const fid = Number(frame.id);
      frame.chase = { flag: HitFlag.EnemyFighter, lost: ChaseLost.Hover };
      if (fid >= 50 && fid <= 59) {
        frame.key_down = { 'F': { id: '' + (fid - 50), wait: 'i', expression: hp_gt_0 } };
        break;
      } else if (fid >= 1 && fid <= 9) {
        frame.key_down = { 'B': { id: '' + (fid + 50), wait: 'i', expression: hp_gt_0 } };
        break;
      }
      break;
    }
  }
}
