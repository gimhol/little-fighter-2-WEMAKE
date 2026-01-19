import { IFrameInfo, OpointKind, BuiltIn_OID, OpointMultiEnum, OpointSpreading } from "../defines";
import { ensure } from "../utils";


export function jan_chaseh_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: BuiltIn_OID.JanChaseh,
    x,
    y,
    action: { id: "0" },
    multi: { type: OpointMultiEnum.AccordingAllies, min: 1 },
    spreading: OpointSpreading.AngelBlessing
  });
}
