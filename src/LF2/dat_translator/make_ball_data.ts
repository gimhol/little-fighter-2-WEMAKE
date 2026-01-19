import { ItrKind, StateEnum } from "../defines";
import { ActionType } from "../defines/ActionType";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { EntityEnum } from "../defines/EntityEnum";
import { EntityVal } from "../defines/EntityVal";
import { IDatIndex } from "../defines/IDatIndex";
import { IEntityData } from "../defines/IEntityData";
import { IEntityInfo } from "../defines/IEntityInfo";
import { IFrameInfo } from "../defines/IFrameInfo";
import { SpeedMode } from "../defines/SpeedMode";
import { ceil, ensure } from "../utils";
import { foreach } from "../utils/container_help/foreach";
import { traversal } from "../utils/container_help/traversal";
import { to_num } from "../utils/type_cast/to_num";
import { CondMaker } from "./CondMaker";
import { cook_ball_frame_state_3000 } from "./cook_ball_frame_state_3000";
import { cook_ball_frame_state_3005 } from "./cook_ball_frame_state_3005";
import { cook_ball_frame_state_3006 } from "./cook_ball_frame_state_3006";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { make_frame_behavior } from "./make_frame_behavior";
import { take, take_str } from "./take";

export const hp_gt_0 = new CondMaker<EntityVal>().and(EntityVal.HP, '>', 0).done()
export function make_ball_data(
  info: IEntityInfo,
  frames: Record<string, IFrameInfo>,
  datIndex: IDatIndex,
): IEntityData {
  info.hp = 500;

  let weapon_broken_sound = take_str(info, "weapon_broken_sound");
  if (weapon_broken_sound) {
    weapon_broken_sound = (weapon_broken_sound + ".mp3").replace(/\\/g, '/');
    info.dead_sounds = [weapon_broken_sound];
  }

  let weapon_drop_sound = take_str(info, "weapon_drop_sound");
  if (weapon_drop_sound) {
    weapon_drop_sound = (weapon_drop_sound + ".mp3").replace(/\\/g, '/');
    info.drop_sounds = [weapon_drop_sound];
  }

  let weapon_hit_sound = take_str(info, "weapon_hit_sound");
  if (weapon_hit_sound) {
    weapon_hit_sound = (weapon_hit_sound + ".mp3").replace(/\\/g, '/');
    info.hit_sounds = [weapon_hit_sound];
  }


  const ret: IEntityData = {
    id: datIndex.id,
    type: EntityEnum.Ball,
    base: info,
    frames: frames,
  };

  traversal(ret.frames, (_, frame) => {
    const hit_j = take(frame, "hit_j");
    if (hit_j !== 0) {
      frame.vzm = SpeedMode.Extra
      frame.dvz = to_num(hit_j, 50) - 50;
    }
    const hit_a = take(frame, "hit_a");
    if (hit_a) frame.hp = ceil(hit_a / 2);

    const hit_d = take(frame, "hit_d");
    if (hit_d && hit_d !== frame.id)
      frame.on_dead = get_next_frame_by_raw_id(hit_d);

    make_frame_behavior(frame, datIndex);

    if (frame.itr) {
      for (const itr of frame.itr) {
        if (itr.kind === ItrKind.JohnShield) {
          if (hit_d) {
            itr.actions = ensure(itr.actions, {
              type: ActionType.A_NextFrame,
              test: new CondMaker<C_Val>()
                .add(C_Val.VictimType, "==", EntityEnum.Fighter)
                .done(),
              data: { id: hit_d }
            })
          }
        }
        if (
          weapon_hit_sound &&
          itr.kind !== ItrKind.Whirlwind &&
          itr.kind !== ItrKind.Freeze &&
          itr.kind !== ItrKind.Block &&
          itr.kind !== ItrKind.Heal
        ) {
          itr.actions = ensure(itr.actions, {
            type: ActionType.A_Sound,
            data: { path: [weapon_hit_sound] }
          })
        }
      }
    }
    frame.gravity_enabled = frame.gravity_enabled ?? false


    switch (frame.state) {
      case StateEnum.Ball_Flying:
        return cook_ball_frame_state_3000(ret, frame);
      case StateEnum.Ball_Hitting:
        return cook_ball_frame_state_3000(ret, frame);
      case StateEnum.Ball_3005:
        return cook_ball_frame_state_3005(ret, frame);
      case StateEnum.Ball_3006:
        return cook_ball_frame_state_3006(ret, frame);
    }

    foreach(frame.itr, itr => {
      switch (itr.kind as ItrKind) {
        case ItrKind.Normal:
        case ItrKind.JohnShield:
        case ItrKind.CharacterThrew:
        case ItrKind.WeaponSwing:
          if (ret.base.hit_sounds?.length)
            itr.actions = ensure(itr.actions, {
              type: ActionType.A_Sound,
              data: { path: ret.base.hit_sounds }
            })
          break;

        case ItrKind.Catch:
        case ItrKind.Pick:
        case ItrKind.ForceCatch:
        case ItrKind.SuperPunchMe:
        case ItrKind.PickSecretly:
        case ItrKind.Heal:
        case ItrKind.MagicFlute:
        case ItrKind.MagicFlute2:
        case ItrKind.Block:
        case ItrKind.Whirlwind:
        case ItrKind.Freeze:
      }
    })


  });
  return ret;
}

