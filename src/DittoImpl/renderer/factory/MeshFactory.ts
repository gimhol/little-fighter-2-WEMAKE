import { BufferGeometry, Mesh, MeshBasicMaterial } from "../../_t";
import { get_static_plane_geometry } from "../GeometryKeeper";
import { OutlineMaterial } from "../materials/OutlineMaterial";
import { InstFactory, Kind } from "../../../LF2/base/InstFactory";
import { MaterialFactory, MaterialKind } from "./MaterialFactory";
export enum MeshKind {
  Invalid = 0,
  Blood = 'Blood',
  Entity = 'Entity',
}
export const MeshFactory = new class _MeshFactory extends InstFactory<Mesh> {
  readonly TAG = 'MeshFactory';
  override get_kind(inst: Mesh): Kind {
    return inst.userData.mesh_factory_kind as Kind;
  }
  override set_kind(inst: Mesh, kind: Kind): void {
    inst.userData.mesh_factory_kind = kind;
  }
}

const BLOOD_GEOMETRY = get_static_plane_geometry(1, 3, 0, -1.25);
MeshFactory.register({
  kind: MeshKind.Blood,
  cls: Mesh<BufferGeometry, MeshBasicMaterial>,
  create: () => {
    const m = MaterialFactory.get(MaterialKind.Red, MeshBasicMaterial);
    const ret = new Mesh(BLOOD_GEOMETRY, m);
    ret.position.z = 1;
    ret.visible = false;
    return ret;
  },
  reset: (c: Mesh) => { },
})

const BODY_GEOMETRY = get_static_plane_geometry(1, 1, 0.5, -0.5);
MeshFactory.register({
  kind: MeshKind.Entity,
  cls: Mesh<BufferGeometry, OutlineMaterial>,
  create: () => {
    const m = MaterialFactory.get(MaterialKind.Outline, OutlineMaterial);
    m.outlineWidth = 1;
    const ret = new Mesh(BODY_GEOMETRY, m);
    ret.visible = false;
    return ret;
  },
  reset: (c: Mesh) => { },
})