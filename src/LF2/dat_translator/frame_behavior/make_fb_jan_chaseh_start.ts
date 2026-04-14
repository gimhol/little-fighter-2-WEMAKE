import { BuiltIn_OID as OID } from "../../defines/BuiltIn_OID";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { OpointKind } from "../../defines/OpointKind";
import { OpointMultiEnum } from "../../defines/OpointMultiEnum";
import { OpointSpreading } from "../../defines/OpointSpreading";
import { ensure } from "../../utils/container_help/ensure";

export function make_fb_jan_chaseh_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: OID.JanChaseh,
    x,
    y,
    action: { id: "0" },
    multi: { type: OpointMultiEnum.AccordingAllies, min: 1 },
    spreading: OpointSpreading.AngelBlessing
  });
}
