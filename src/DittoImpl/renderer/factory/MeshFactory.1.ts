import type { Mesh } from "three";
import { InstFactory, Kind } from "./InstFactory";

export const MeshFactory = new class MeshFactory extends InstFactory<Mesh> {
  override readonly TAG = 'MeshFactory';

  override get_kind(inst: Mesh): Kind {
    return inst.userData.material_factory_kind;
  }
  override set_kind(inst: Mesh, kind: Kind): void {
    inst.userData.material_factory_kind = kind;
  }
};
