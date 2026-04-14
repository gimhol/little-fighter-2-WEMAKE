import { BuiltIn_OID as OID } from "../../defines/BuiltIn_OID";
import { Defines as D } from "../../defines/defines";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { OpointKind } from "../../defines/OpointKind";
import { OpointMultiEnum } from "../../defines/OpointMultiEnum";
import { OpointSpreading } from "../../defines/OpointSpreading";
import { ensure } from "../../utils/container_help/ensure";

export function make_fb_bat_chase_start(frame: IFrameInfo) {
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: OID.BatChase,
    x: frame.centerx,
    y: frame.centery,
    action: { id: "0" },
    multi: {
      type: OpointMultiEnum.AccordingEnemies,
      min: 3,
      skip_zero: false,
    },
    spreading: OpointSpreading.Spreading,
    spreading_x: [...D.BAT_CHASE_SPREADING_VX],
    spreading_z: [...D.BAT_CHASE_SPREADING_VZ],
  });
}
