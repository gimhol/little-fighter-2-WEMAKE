import { EntityVal as EV, } from "../defines/EntityVal";
import { WeaponType as WT } from "../defines/WeaponType";
import { FacingFlag as FF } from "../defines/FacingFlag";
import { type IFrameInfo } from "../defines/IFrameInfo";
import { CondMaker } from "./CondMaker";
import { assign } from "../utils/container_help/assign";
import { INextFrame } from "../defines";
export namespace hit_next_frame {
  export function drink(): INextFrame[] {
    return [{
      id: "55", desc: 'drink',
      expression: new CondMaker<EV>()
        .one_of(EV.Holding_W_Type, WT.Drink)
        .done(),
    }];
  }
  export function super_punch(): INextFrame[] {
    return [{
      id: "70", facing: FF.Ctrl, desc: "super_punch",
      expression: new CondMaker<EV>()
        .add(EV.RequireSuperPunch, "==", 1)
        .done(),
    }]
  }
  export function punch(): INextFrame[] {
    return [{
      id: ["60", "65"], facing: FF.Ctrl, desc: "punch",
    }]
  }
  export function turn_back(frame: IFrameInfo, back_frame?: string) {
    if (back_frame == void 0) {
      frame.facing = FF.Ctrl;
      return;
    }
    frame.key_down = assign(frame.key_down, {
      B: {
        id: back_frame,
        wait: "i",
        facing: FF.Backward
      }
    });
  }

  export function jump(): INextFrame[] {
    return [{ id: "210", facing: FF.Ctrl }]
  }
  export function defend(): INextFrame[] {
    return [{ id: "110", facing: FF.Ctrl }]
  }
  export function weapon_atk(): INextFrame[] {
    return [{
      id: "45", facing: FF.Ctrl,
      expression: new CondMaker<EV>()
        .add(EV.Holding_W_Type, "==", WT.Baseball)
        .or((v) => v
          .add(EV.Holding_W_Type, "==", WT.Knife)
          .and(EV.PressFB, "!=", 0),
        ).done(),
    }, {
      id: ["20", "25"], facing: FF.Ctrl,
      expression: new CondMaker<EV>()
        .one_of(EV.Holding_W_Type, WT.Knife, WT.Stick)
        .done(),
    }]
  }
}
