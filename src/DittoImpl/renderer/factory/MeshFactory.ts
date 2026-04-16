import { Mesh } from "../../_t";
import { InstFactory, Kind } from "./InstFactory";

export const MeshFactory = new class _MeshFactory extends InstFactory<Mesh> {
  readonly TAG = 'MeshFactory';
  override get_kind(inst: Mesh): Kind {
    return inst.userData.mesh_factory_kind as Kind;
  }
  override set_kind(inst: Mesh, kind: Kind): void {
    inst.userData.mesh_factory_kind = kind;
  }
}
