import { BuiltIn_OID as OID } from "../../defines/BuiltIn_OID";
import { FacingFlag as FF } from "../../defines/FacingFlag";
import { IFrameInfo } from "../../defines/IFrameInfo";
import { OpointKind } from "../../defines/OpointKind";
import { ensure } from "../../utils/container_help/ensure";

export function make_fb_firzen_volcano_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  make_fb_firzen_disater_start(frame, x, y)
  frame.opoint = ensure(frame.opoint, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx,
    y: 24,
    action: { id: "109" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FreezeColumn,
    x: 135,
    y: 24,
    action: { id: "100" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FreezeColumn,
    x: 135,
    y: 24,
    z: -60,
    dvz: -4,
    action: { id: "100" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FreezeColumn,
    x: 135,
    y: 24,
    z: 60,
    dvz: 4,
    action: { id: "100" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FreezeColumn,
    x: -45,
    y: 24,
    action: { id: "100", facing: FF.Backward },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FreezeColumn,
    x: -45,
    y: 24,
    z: -60,
    dvz: -4,
    action: { id: "100", facing: FF.Backward },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FreezeColumn,
    x: -45,
    y: 24,
    z: 60,
    dvz: 4,
    action: { id: "100", facing: FF.Backward },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx,
    y: 26,
    z: 0,
    action: { id: "54" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx - 25,
    y: 26,
    z: 0,
    action: { id: "54" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx + 25,
    y: 26,
    z: 0,
    action: { id: "54", facing: 2 },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx - 50,
    y: 26,
    z: 0,
    action: { id: "54" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx + 50,
    y: 26,
    z: 0,
    action: { id: "54", facing: 2 },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx - 38,
    y: 26,
    z: -15,
    action: { id: "54" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx + 38,
    y: 26,
    z: -15,
    action: { id: "54", facing: 2 },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx - 38,
    y: 26,
    z: 15,
    action: { id: "54" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx + 38,
    y: 26,
    z: 15,
    action: { id: "54", facing: 2 },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx + 10,
    y: 26,
    z: 25,
    action: { id: "54" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx - 10,
    y: 26,
    z: 25,
    action: { id: "54", facing: 2 },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx + 10,
    y: 26,
    z: -25,
    action: { id: "54" },
  }, {
    kind: OpointKind.Normal,
    oid: OID.FirenFlame,
    x: frame.centerx - 10,
    y: 26,
    z: -25,
    action: { id: "54", facing: 2 },
  });
}
function make_fb_firzen_disater_start(frame: IFrameInfo, x: number, y: number) {
  throw new Error("Function not implemented.");
}

