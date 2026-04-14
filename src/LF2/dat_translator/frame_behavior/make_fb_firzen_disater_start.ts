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
