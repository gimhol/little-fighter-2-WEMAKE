import { FacingFlag, IEntityInfo, IFrameInfo, ItrKind, StateEnum, TNextFrame, WeaponType } from "../defines";
import { ActionType } from "../defines/ActionType";
import { BdyKind } from "../defines/BdyKind";
import { EntityEnum } from "../defines/EntityEnum";
import { EntityVal } from "../defines/EntityVal";
import { IEntityData } from "../defines/IEntityData";
import { IFrameIndexes } from "../defines/IFrameIndexes";
import { INextFrame } from "../defines/INextFrame";
import { Defines } from "../defines/defines";
import { ensure, round } from "../utils";
import { set_obj_field } from "../utils/container_help/set_obj_field";
import { take_number } from "../utils/container_help/take_number";
import { traversal } from "../utils/container_help/traversal";
import { is_num, is_str } from "../utils/type_check";
import { CondMaker } from "./CondMaker";
import { FrameEditing } from "./FrameEditing";
import { cook_file_variants } from "./cook_file_variants";
import { cook_next_frame_mp_hp } from "./cook_next_frame_mp_hp";
import { add_next_frame, edit_next_frame } from "./edit_next_frame";
import {
  get_next_frame_by_raw_id,
} from "./get_the_next";
import { take } from "./take";
import { take_raw_frame_mp } from "./take_raw_frame_mp";
const k_9 = ["Fa", "Fj", "Da", "Dj", "Ua", "Uj", "ja"] as const;

const set_hit_turn_back = (frame: IFrameInfo, back_frame_id?: string) => {
  frame.key_down = frame.key_down || {};
  frame.key_down.B = { id: back_frame_id, wait: "i", facing: FacingFlag.Backward };
};
export function make_character_data(
  info: IEntityInfo,
  frames: Record<string, IFrameInfo>,
): IEntityData {
  const walking_frame_rate = take_number(info, "walking_frame_rate", 3);
  const running_frame_rate = take_number(info, "running_frame_rate", 3);
  const walking_speed = take_number(info, "walking_speed", 0);
  const walking_speedz = take_number(info, "walking_speedz", 0);
  const running_speed = take_number(info, "running_speed", 0);
  const running_speedz = take_number(info, "running_speedz", 0);
  const heavy_walking_speed = take_number(info, "heavy_walking_speed", 0);
  const heavy_walking_speedz = take_number(info, "heavy_walking_speedz", 0);
  const heavy_running_speed = take_number(info, "heavy_running_speed", 0);
  const heavy_running_speedz = take_number(info, "heavy_running_speedz", 0);
  const rowing_height = take_number(info, "rowing_height", 0);

  if (info.jump_height)
    info.jump_height = round((info.jump_height * info.jump_height) / 3.5);
  if (info.dash_height)
    info.dash_height = round((info.dash_height * info.dash_height) / 3.5);
  if (info.rowing_height)
    info.rowing_height = round(info.rowing_height * info.rowing_height / 3.5);
  // if (info.rowing_height) info.rowing_height = -info.rowing_height;

  if (info.dash_distance) info.dash_distance /= 2;
  if (info.jump_distance) info.jump_distance /= 2;
  if (info.rowing_distance) info.rowing_distance /= 2;

  const round_trip_frames_map: any = {};
  const frame_mp_hp_map = new Map<string, [number, number]>();

  traversal(frames, (frame_id, frame) => {
    frame_mp_hp_map.set(frame_id, take_raw_frame_mp(frame));
  });

  for (const [frame_id, frame] of traversal(frames)) {
    if (Array.isArray(frame.next)) {
      for (const n of frame.next)
        cook_next_frame_mp_hp(n, "next", frame_mp_hp_map);
    } else {
      cook_next_frame_mp_hp(frame.next, "next", frame_mp_hp_map);
    }

    const hit_a = take(frame, "hit_a");
    if (hit_a)
      frame.hit = set_obj_field(
        frame.hit,
        "a",
        get_next_frame_by_raw_id(hit_a, "hit", frame_mp_hp_map),
      );
    const hit_j = take(frame, "hit_j");
    if (hit_j)
      frame.hit = set_obj_field(
        frame.hit,
        "j",
        get_next_frame_by_raw_id(hit_j, "hit", frame_mp_hp_map),
      );
    const hit_d = take(frame, "hit_d");
    if (hit_d)
      frame.hit = set_obj_field(
        frame.hit,
        "d",
        get_next_frame_by_raw_id(hit_d, "hit", frame_mp_hp_map),
      );

    k_9.forEach((k) => {
      const next = take(frame, `hit_${k}`);

      if (!is_str(next) && !is_num(next)) return;
      if (next === "0" || next === 0) return;

      if (!frame.hit) frame.hit = {};
      if (!frame.seqs) frame.seqs = {};
      const nf = get_next_frame_by_raw_id(next, "hit", frame_mp_hp_map);

      if (k === "Fa" || k === "Fj") {
        frame.seqs["L" + k[1]] = {
          ...nf,
          facing:
            nf.facing === FacingFlag.Backward
              ? FacingFlag.Right
              : FacingFlag.Left,
        };
        frame.seqs["R" + k[1]] = {
          ...nf,
          facing:
            nf.facing === FacingFlag.Backward
              ? FacingFlag.Right
              : FacingFlag.Right,
        };
      } else {
        frame.seqs[k] = nf;
      }
    });

    const editing = new FrameEditing(frame);
    switch (Number(frame.id)) {
      /** standing */
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
        break;
      /** walking */
      case 5:
      case 6:
      case 7:
      case 8: {
        set_hit_turn_back(frame);
        editing.hit('a', {
          // weapon throw
          id: "45", facing: FacingFlag.Ctrl, desc: "weapon throw",
          expression: new CondMaker<EntityVal>()
            .add(EntityVal.Holding_W_Type, "==", WeaponType.Baseball)
            .or(c => c
              .add(EntityVal.Holding_W_Type, "==", WeaponType.Knife)
              .and(EntityVal.PressFB, "!=", 0),
            ).done(),
        }, { // weapon swing
          id: ["20", "25"], facing: FacingFlag.Ctrl, desc: "weapon swing",
          expression: new CondMaker<EntityVal>()
            .one_of(EntityVal.Holding_W_Type, WeaponType.Knife, WeaponType.Stick)
            .done(),
        }, { // drink
          id: "55", facing: FacingFlag.Ctrl,
          expression: new CondMaker<EntityVal>()
            .one_of(EntityVal.Holding_W_Type, WeaponType.Drink)
            .done(),
        }, { // super_punch
          id: "70", facing: FacingFlag.Ctrl, desc: "super_punch",
          expression: new CondMaker<EntityVal>()
            .add(EntityVal.RequireSuperPunch, "==", 1)
            .done(),
        }, { // punch
          id: ["60", "65"], facing: FacingFlag.Ctrl, desc: "punch",
        })
          .hit('j', { id: "210" }) // jump
          .hit('d', { id: "110" }) // defend
          .hit('FF', { id: "running_0" })
        frame.dvx = walking_speed / 2;
        frame.dvz = walking_speedz;
        frame.ctrl_z = 1;
        frame.ctrl_x = 1;
        break;
      }
      /** running */
      case 9:
      case 10:
      case 11: {
        editing.hit('a', {
          // 丢出武器
          id: "45",
          expression: new CondMaker<EntityVal>()
            .add(EntityVal.Holding_W_Type, "==", WeaponType.Baseball)
            .or(c => c
              .add(EntityVal.PressFB, "==", 1)
              .and(EntityVal.Holding_W_Type, "!=", WeaponType.None),
            ).done(),
        }, { // drink
          id: "55",
          expression: new CondMaker<EntityVal>()
            .one_of(EntityVal.Holding_W_Type, WeaponType.Drink)
            .done(),
        }, {
          id: "35",
          expression: new CondMaker<EntityVal>()
            .one_of(EntityVal.Holding_W_Type, WeaponType.Knife, WeaponType.Stick)
            .done()
        }, { // run_atk
          id: "85"
        }).hit('j', { id: "213" }) // dash
          .hit('d', { id: "102" }) // rowing
          .keydown('B', { id: "218" }); // running_stop
        frame.dvx = Number((running_speed / 2).toFixed(1));
        frame.dvz = running_speedz;
        frame.ctrl_z = 1;
        break;
      }
      /** heavy_obj_walk */
      case 12:
      case 13:
      case 14:
      case 15: {
        set_hit_turn_back(frame);
        // set_hold_turn_back(frame);
        frame.hit = frame.hit || {};
        frame.hit.FF = { id: "heavy_obj_run_0" };
        frame.hit.a = add_next_frame(frame.hit.a, { id: "50", facing: FacingFlag.Ctrl }); // running_stop
        frame.dvx = heavy_walking_speed / 2;
        frame.dvz = heavy_walking_speedz;
        frame.ctrl_x = frame.ctrl_z = 1;
        break;
      }
      /** heavy_obj_run */
      case 16:
      case 17:
      case 18: {
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};
        frame.key_down = frame.key_down || {};
        frame.key_down.B = { id: "19" }; // running_stop
        frame.hit.a = add_next_frame(frame.hit.a, { id: "50" });
        frame.dvx = Number((heavy_running_speed / 2).toFixed(1));
        frame.dvz = heavy_running_speedz;
        frame.ctrl_z = 1;
        break;
      }
      /*
        defend 110
        defend_hit 111
       */
      case 110:
      case 111: {
        set_hit_turn_back(frame);
        // set_hold_turn_back(frame);
        if (frame.bdy?.length)
          for (const bdy of frame.bdy) {
            bdy.actions = ensure(bdy.actions,
              { type: ActionType.V_BrokenDefend, data: { id: "112" } },
              { type: ActionType.V_Defend, data: { id: "111" } }
            );
          }
        break;
      }
      /** broken_defend */
      case 112: {
        break;
      }
      /** jump */
      case 210:
      case 211:
      case 212: {
        set_hit_turn_back(frame);
        // set_hold_turn_back(frame);
        frame.hit = frame.hit || {};
        frame.key_down = frame.hit || {};
        frame.hold = frame.hold || {};

        if (frame_id === "211") frame.jump_flag = 1;
        if (frame_id === "212") {
          add_key_down_jump_atk(frame); // jump_atk
        }
        frame.key_down.B = { facing: FacingFlag.Ctrl };
        break;
      }
      /** dash */
      case 213:
      case 214:
      case 216:
      case 217: {
        if (frame_id === "213" && frames[214]) set_hit_turn_back(frame, "214"); // turn back;
        if (frame_id === "216" && frames[217]) set_hit_turn_back(frame, "217"); // turn back;
        if (frame_id === "214" && frames[213]) set_hit_turn_back(frame, "213"); // turn back;
        if (frame_id === "217" && frames[216]) set_hit_turn_back(frame, "216"); // turn back;
        // julian和knight的dash非常特殊……
        if (frame.state === StateEnum.Dash && (frame_id === "213" || frame_id === "216")) {
          frame.key_down = frame.key_down || {};
          frame.key_down.a = add_next_frame(frame.key_down.a,
            {
              id: "52", facing: FacingFlag.Ctrl,
              expression: new CondMaker<EntityVal>()
                .one_of(
                  EntityVal.Holding_W_Type,
                  WeaponType.Baseball,
                  WeaponType.Drink,
                )
                .done(),
            },
            {
              id: "40", facing: FacingFlag.Ctrl,
              expression: new CondMaker<EntityVal>()
                .one_of(
                  EntityVal.Holding_W_Type,
                  WeaponType.Knife,
                  WeaponType.Stick,
                ).done(),
            },
            { id: "90" },
          ); // dash_atk
        }

        if (frame.state === StateEnum.Jump) {
          add_key_down_jump_atk(frame)
          frame.state = StateEnum.Dash
        }
        break;
      }

      /** catching */
      case 120:
      case 121:
      case 122:
      case 123:
        if (frame.cpoint) {
          if (frame.cpoint.vaction)
            (frame.cpoint?.vaction as INextFrame).facing =
              FacingFlag.OpposingCatcher;
          const a_action = take(frame.cpoint, "aaction");
          const t_action = take(frame.cpoint, "taction");
          const s_hit_a = frame.hit?.a;
          let t_hit_a: INextFrame[] | undefined;
          let a_hit_a: INextFrame | undefined;
          if (t_action) {
            t_hit_a = [
              {
                ...get_next_frame_by_raw_id(t_action),
                facing: FacingFlag.Ctrl,
                expression: new CondMaker<EntityVal>()
                  .add(EntityVal.Catching, "==", 1)
                  .and()
                  .wrap((c) => {
                    return c
                      .add(EntityVal.PressFB, "!=", 0)
                      .or(EntityVal.PressUD, "!=", 0);
                  })
                  .done(),
              },
            ];
          }
          if (a_action)
            a_hit_a = {
              ...get_next_frame_by_raw_id(a_action),
              expression: new CondMaker<EntityVal>()
                .add(EntityVal.Catching, "==", 1)
                .done(),
            };
          if (Array.isArray(s_hit_a)) {
            t_hit_a && s_hit_a.unshift(...t_hit_a);
            a_hit_a && s_hit_a.unshift(a_hit_a);
          } else {
            let c = 0;
            if (s_hit_a) ++c;
            if (t_hit_a) ++c;
            if (a_hit_a) ++c;
            if (c >= 2) {
              const hit_a: INextFrame[] = [];
              s_hit_a && hit_a.push(s_hit_a);
              t_hit_a && hit_a.push(...t_hit_a);
              a_hit_a && hit_a.push(a_hit_a);
              frame.hit = frame.hit || {};
              frame.hit.a = add_next_frame(frame.hit.a, ...hit_a);
            } else if (c === 1) {
              frame.hit = frame.hit || {};
              if (s_hit_a)
                frame.hit.a = add_next_frame(frame.hit.a, s_hit_a);
              else if (t_hit_a)
                frame.hit.a = add_next_frame(frame.hit.a, ...t_hit_a);
              else if (a_hit_a)
                frame.hit.a = add_next_frame(frame.hit.a, a_hit_a);
            }
          }
        }

        break;

      /** throw_lying_man */
      case 232:
      case 233:
      case 234:
        if (frame.cpoint?.vaction)
          (frame.cpoint?.vaction as INextFrame).facing =
            FacingFlag.OpposingCatcher;
        break;
      case 100:
      case 108:
        // frame.dvy = -rowing_height / frame.wait;
        // frame.dvy = -rowing_height / frame.wait;
        break;
      /** （180~185）falling 向前 */
      case 180:
        break;
      case 181:
      case 182:
        editing.hit('j', {
          id: "100",
          expression: new CondMaker<EntityVal>()
            .add(EntityVal.HP, ">", 0)
            .and(EntityVal.LastestCollidedItrKind, "!=", ItrKind.MagicFlute)
            .and(EntityVal.LastestCollidedItrKind, "!=", ItrKind.MagicFlute2)
            .done(),
        });
        break;
      case 183:
      case 184:
      case 185:
        break;

      /** （186~191）falling 向后 */
      case 186:
        break;
      case 187:
      case 188:
        if (!frame.hit) frame.hit = {};
        frame.hit.j = add_next_frame(frame.hit.j, {
          id: "108",
          expression: new CondMaker<EntityVal>()
            .add(EntityVal.HP, ">", 0)
            .done(),
        });
        break;
      case 189:
      case 190:
      case 191:
        break;
      case 200:
        frame.state = StateEnum.Frozen;
        break;
      /** crouch */
      case 215:
        const to_dash_frame: TNextFrame = [
          {
            id: "213",
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.PressLR, "==", -1)
              .done(),
            facing: FacingFlag.Left,
          },
          {
            id: "213",
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.PressLR, "==", 1)
              .done(),
            facing: FacingFlag.Right,
          },
          {
            id: "214",
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.TrendX, "==", -1)
              .done(),
          },
          {
            id: "213",
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.TrendX, "==", 1)
              .done(),
          },
        ]; // dash
        frame.hit = frame.hit || {};
        frame.hit.d = { id: "102", facing: FacingFlag.Ctrl };
        frame.hit.j = to_dash_frame;
        // frame.hold = frame.hold || {};
        // frame.hold.d = { id: '102', facing: FacingFlag.ByController };
        // frame.hold.j = to_dash_frame;
        break;
    }
    switch (frame.state) {
      case StateEnum.Frozen:
        edit_next_frame(frame.next, (i) => {
          const f = typeof i.id === "string" && frames[i.id];
          if (!f) return;
          if (f.state !== StateEnum.Frozen) {
            i.blink_time = 60;
          }
        });
        break;

      case StateEnum.Standing:
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};
        frame.key_down = frame.key_down || {}
        frame.hit.a = [
          {
            id: "45",
            facing: FacingFlag.Ctrl,
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.Holding_W_Type, "==", WeaponType.Baseball)
              .or((v) =>
                v
                  .add(EntityVal.Holding_W_Type, "==", WeaponType.Knife)
                  .and(EntityVal.PressFB, "!=", 0),
              )
              .done(),
          },
          {
            id: ["20", "25"],
            facing: FacingFlag.Ctrl,
            expression: new CondMaker<EntityVal>()
              .one_of(EntityVal.Holding_W_Type, WeaponType.Knife, WeaponType.Stick)
              .done(),
          },
          {
            id: "55",
            expression: new CondMaker<EntityVal>()
              .one_of(EntityVal.Holding_W_Type, WeaponType.Drink)
              .done(),
            facing: FacingFlag.Ctrl,
          },
          {
            id: "70",
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.RequireSuperPunch, "==", 1)
              .done(),
          },
          { id: ["60", "65"], facing: FacingFlag.Ctrl },
        ]; // punch
        frame.hit.j = { id: "210", facing: FacingFlag.Ctrl }; // jump
        frame.hit.d = { id: "110", facing: FacingFlag.Ctrl }; // defend
        frame.key_down.U = frame.key_down.D =
          frame.key_down.L = frame.key_down.R =
          { id: "walking_0", facing: FacingFlag.Ctrl }; // walking
        frame.hit.FF = frame.hit.FF = { id: "running_0" };
        break;
      case StateEnum.BurnRun:
      case StateEnum.Z_Moveable:
        frame.dvz = running_speedz;
        frame.ctrl_z = 1;
        break;
      case StateEnum.Defend: {
        if (frame.bdy?.length)
          for (const bdy of frame.bdy) {
            bdy.kind = BdyKind.Defend;
            bdy.kind_name = BdyKind[bdy.kind];
            if (!bdy.actions?.find(v => v.type === ActionType.V_BrokenDefend)) {
              bdy.actions = ensure(bdy.actions, {
                type: ActionType.V_BrokenDefend,
                data: { id: "112" }
              })
            }
          }
        break;
      }
      case StateEnum.Walking:
        /** heavy_obj_walk */
        if (
          frame_id !== "12" &&
          frame_id !== "13" &&
          frame_id !== "14" &&
          frame_id !== "15"
        ) {
          frame.hit = frame.hit || {};
          frame.hit.a = [
            {
              id: ["45"],
              facing: FacingFlag.Ctrl,
              expression: new CondMaker<EntityVal>()
                .add(EntityVal.Holding_W_Type, "==", WeaponType.Baseball)
                .or((v) =>
                  v
                    .add(EntityVal.Holding_W_Type, "==", WeaponType.Knife)
                    .and(EntityVal.PressFB, "!=", 0),
                )
                .done(),
            },
            {
              id: ["20", "25"],
              facing: FacingFlag.Ctrl,
              expression: new CondMaker<EntityVal>()
                .one_of(
                  EntityVal.Holding_W_Type,
                  WeaponType.Knife,
                  WeaponType.Stick,
                )
                .done(),
            }, // drink
            {
              id: "55",
              expression: new CondMaker<EntityVal>()
                .one_of(EntityVal.Holding_W_Type, WeaponType.Drink)
                .done(),
              facing: FacingFlag.Ctrl,
            },
            {
              id: "70",
              expression: new CondMaker<EntityVal>()
                .add(EntityVal.RequireSuperPunch, "==", 1)
                .done(),
            },
            { id: ["60", "65"], facing: FacingFlag.Ctrl },
          ]; // punch
          frame.hit.j = { id: "210" }; // jump
          frame.hit.d = { id: "110" }; // defend
          frame.hit.FF = { id: "running_0" };
          frame.dvx = walking_speed / 2;
          frame.dvz = walking_speedz;
          frame.ctrl_x = frame.ctrl_z = 1;
          frame.wait = walking_frame_rate * 2 - 1;
        }
        set_hit_turn_back(frame);
        // set_hold_turn_back(frame);
        round_trip_frames_map[frame.name] =
          round_trip_frames_map[frame.name] || [];
        round_trip_frames_map[frame.name].push(frame);
        delete frames[frame_id];
        break;
      case StateEnum.Running: {
        /** heavy_obj_run */
        if (frame_id !== "16" && frame_id !== "17" && frame_id !== "18") {
          frame.hit = frame.hit || {};
          frame.hit.a = [
            {
              // 丢出武器
              id: ["45"],
              expression: new CondMaker<EntityVal>()
                .add(EntityVal.Holding_W_Type, "==", WeaponType.Baseball)
                .or((v) =>
                  v
                    .add(EntityVal.PressFB, "==", 1)
                    .and(EntityVal.Holding_W_Type, "!=", WeaponType.None),
                )
                .done(),
            }, // drink
            {
              id: "55",
              expression: new CondMaker<EntityVal>()
                .one_of(EntityVal.Holding_W_Type, WeaponType.Drink)
                .done(),
            },
            {
              id: "35",
              expression: new CondMaker<EntityVal>()
                .one_of(
                  EntityVal.Holding_W_Type,
                  WeaponType.Knife,
                  WeaponType.Stick,
                )
                .done(),
              facing: FacingFlag.Ctrl,
            },
            { id: "85" },
          ]; // run_atk
          frame.hit.j = { id: "213" }; // dash
          frame.hit.d = { id: "102" }; // rowing
          frame.key_down = frame.key_down || {};
          frame.key_down.B = { id: "218" }; // running_stop
          frame.dvx = Number((running_speed / 2).toFixed(1));
          frame.dvz = running_speedz;
          frame.ctrl_z = 1;
          /* 
            NOTE: 
              在原版LF2中，角色走路和跑步是用帧的往返切换来实现的。
              这打破了wait next的规则。
              我不希望打破这个规则。
              从原版数据转换过来时，帮助生成额外的帧来实现相同的效果。
              这样，在WEMAKE中，可以实现更合理的走路和跑步动画。
              
              原版：0 ==> 1 ==> 2 ==> 1 ==>0
              WEMAKE: 0 ==> 1 ==> 2 ==> copy_1 ==> 0
          */
          frame.wait = running_frame_rate * 2 - 1;
        }
        round_trip_frames_map[frame.name] =
          round_trip_frames_map[frame.name] || [];
        round_trip_frames_map[frame.name].push(frame);
        delete frames[frame_id];
        break;
      }
      case StateEnum.NextAsLanding: {
        frame.next = { id: "94" };
        break;
      }
    }
  }
  const make_round_trip_frames = (prefix: string, src_frames: IFrameInfo[]) => {
    for (let i = 0; i < 2 * src_frames.length - 2; ++i) {
      const frame =
        i < src_frames.length
          ? src_frames[i]
          : { ...src_frames[2 * (src_frames.length - 1) - i] };
      frame.id = `${prefix}_${i}`;
      frame.next = {
        id: `${prefix}_${i === 2 * src_frames.length - 3 ? 0 : i + 1}`,
      };
      if (
        frame.state === StateEnum.Standing ||
        frame.state === StateEnum.Walking
      ) {
        frame.next.facing = FacingFlag.Ctrl
      }
      frames[frame.id] = frame;
    }
  };
  for (const key in round_trip_frames_map)
    make_round_trip_frames(key, round_trip_frames_map[key]);

  const indexes: IFrameIndexes = {
    standing: "0",
    heavy_obj_walk: ["heavy_obj_walk_0"],
    picking_light: "115",
    picking_heavy: "117",
    ice: "200",
    fire: ["203", "205"],
    injured: {
      [-1]: "220",
      1: "222",
    },
    dizzy: "226",
    lying: {
      [-1]: "230",
      1: "231",
    },
    grand_injured: {
      [-1]: ["220"],
      1: ["222"],
    },
    in_the_skys: ["212"],
    critical_hit: {
      [-1]: ["180"],
      1: ["186"],
    },
    falling: {
      [-1]: ["181", "182", "183"],
      1: ["187", "188", "189"],
    },
    bouncing: {
      [-1]: ["184", "185"],
      1: ["190", "191"],
    },
    landing_1: "215",
    landing_2: "219",
  };

  const ret: IEntityData = {
    id: "",
    type: EntityEnum.Fighter,
    base: info,
    indexes,
    frames,
  };
  cook_transform_begin_expression_to_hit(ret.frames);
  cook_file_variants(ret);
  return ret;
}

function add_key_down_jump_atk(frame: IFrameInfo) {
  frame.key_down = frame.key_down || {}
  frame.key_down.a = add_next_frame({
    id: "52", // 角色跳跃丢出武器
    facing: FacingFlag.Ctrl,
    desc: "空中丢出武器",
    expression: new CondMaker<EntityVal>()
      .one_of(
        EntityVal.Holding_W_Type,
        WeaponType.Baseball,
        WeaponType.Drink
      )
      .or((v) => v
        .add(EntityVal.PressFB, "!=", 0)
        .and(EntityVal.Holding_W_Type, "!=", WeaponType.None)
      )
      .done(),
  }, {
    id: "30", // 角色跳跃用武器攻击
    facing: FacingFlag.Ctrl,
    desc: "空中武器攻击",
    expression: new CondMaker<EntityVal>()
      .one_of(
        EntityVal.Holding_W_Type,
        WeaponType.Knife,
        WeaponType.Stick
      )
      .done(),
  }, {
    id: "80", // 角色跳跃攻击
    desc: "跳跃攻击",
    facing: FacingFlag.Ctrl,
  });
}

function cook_transform_begin_expression_to_hit<
  F extends IFrameInfo = IFrameInfo,
>(frames: Record<string, F>) {
  const transform_begin_frame_id_list: string[] = [];
  for (const k in frames) {
    const { state, id } = frames[k];
    if (state === StateEnum.TransformToCatching_Begin) {
      transform_begin_frame_id_list.push(id);
    }
  }
  if (transform_begin_frame_id_list.length) {
    const cook_hit_next_frame_to_transform = (n: TNextFrame | undefined) => {
      if (
        !n ||
        Array.isArray(n) ||
        !n.id ||
        Array.isArray(n.id) ||
        transform_begin_frame_id_list.indexOf(n.id) < 0
      )
        return;
      n.expression = new CondMaker()
        .add(EntityVal.HAS_TRANSFORM_DATA, "==", 1)
        .done();
    };
    for (const k in frames) {
      const frame = frames[k];
      const { hit } = frame;
      if (!hit) continue;
      cook_hit_next_frame_to_transform(hit.a);
      cook_hit_next_frame_to_transform(hit.j);
      cook_hit_next_frame_to_transform(hit.d);
      if (frame.seqs)
        for (const k2 in frame.seqs)
          cook_hit_next_frame_to_transform(frame.seqs[k2]);
    }
  }
}

