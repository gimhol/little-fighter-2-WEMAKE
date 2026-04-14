import { BuiltIn_OID as OID } from "../../defines/BuiltIn_OID";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { OpointKind } from "../../defines/OpointKind";
import { OpointSpreading } from "../../defines/OpointSpreading";
import { ensure } from "../../utils/container_help/ensure";

export function make_fb_julian_ball_start(frame: IFrameInfo) {
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: OID.JulianBall,
    x: frame.centerx,
    y: frame.centery,
    dvx: 8,
    action: { id: "50" },
    spreading: OpointSpreading.FloatRange,
    spreading_x: [-5, 5, 5],
    spreading_y: [-5, 5, 10],
  });
}
