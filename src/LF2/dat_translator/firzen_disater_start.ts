import { IFrameInfo, OpointKind, BuiltIn_OID, OpointMultiEnum, OpointSpreading, Defines as D } from "../defines";
import { ensure } from "../utils";


export function firzen_disater_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: [
      BuiltIn_OID.FirzenChasef,
      BuiltIn_OID.FirzenChasei
    ],
    x,
    y,
    dvy: 6,
    action: { id: "0" },
    multi: { type: OpointMultiEnum.AccordingEnemies, min: 4 },
    spreading: OpointSpreading.Spreading,
    spreading_x: [...D.DISATER_SPREADING_VX],
    spreading_y: [...D.DISATER_SPREADING_VY],
  });
}
