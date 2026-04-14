import { BuiltIn_OID as OID } from "../../defines/BuiltIn_OID";
import { Defines as D } from "../../defines/defines";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { OpointKind } from "../../defines/OpointKind";
import { OpointMultiEnum } from "../../defines/OpointMultiEnum";
import { OpointSpreading } from "../../defines/OpointSpreading";
import { ensure } from "../../utils/container_help/ensure";

export function make_fb_jan_chase_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: OID.JanChase,
    x, y, dvy: 6,
    action: { id: "0" },
    multi: {
      type: OpointMultiEnum.AccordingEnemies,
      min: 1,
      skip_zero: true,
    },
    spreading: OpointSpreading.Spreading,
    spreading_x: [...D.DEVIL_JUDGEMENT_SPREADING_VX],
    spreading_y: [...D.DEVIL_JUDGEMENT_SPREADING_VY],
  });
}
