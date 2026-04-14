import { IFrameInfo, OpointKind, BuiltIn_OID as OID, OpointMultiEnum, OpointSpreading, Defines as D } from "../defines";
import { ensure } from "../utils";


export function jan_chase_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
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
