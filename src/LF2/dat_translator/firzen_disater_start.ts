import { IFrameInfo, OpointKind, BuiltIn_OID, OpointMultiEnum, OpointSpreading } from "../defines";
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
    spreading: OpointSpreading.FirzenDisater,
  });
}
