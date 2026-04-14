import { BuiltIn_OID as OID } from "../../defines/BuiltIn_OID";
import { Defines as D } from "../../defines/defines";
import { FacingFlag as FF } from "../../defines/FacingFlag";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { OpointKind } from "../../defines/OpointKind";
import { OpointMultiEnum } from "../../defines/OpointMultiEnum";
import { OpointSpreading } from "../../defines/OpointSpreading";
import { ensure } from "../../utils/container_help/ensure";

export function make_fb_firzen_disater_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: [
      OID.FirzenChasef,
      OID.FirzenChasei
    ],
    x,
    y,
    dvy: 6,
    action: { id: "0" },
    multi: {
      type: OpointMultiEnum.AccordingEnemies,
      min: 4,
      skip_zero: true,
    },
    spreading: OpointSpreading.Spreading,
    spreading_x: [...D.DISATER_SPREADING_VX],
    spreading_y: [...D.DISATER_SPREADING_VY],
  });
}
