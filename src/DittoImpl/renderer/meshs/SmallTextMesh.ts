import { BufferGeometry, Mesh, ShaderMaterial } from "three";
import { IInstCreator, MaterialFactory, MaterialKind, MeshFactory } from "../factory";
import { get_geometry } from "../GeometryKeeper";
const TEXT_GEOMETRY = get_geometry(1, 1);

export const SmallTextMesh: IInstCreator<Mesh<BufferGeometry, ShaderMaterial>> = {
  kind: 'SmallTextMesh',
  cls: Mesh,
  create: () => {
    const m = MaterialFactory.get(MaterialKind.Outline, ShaderMaterial);
    m.uniforms.mixStreath.value = 1;
    m.uniforms.outlineAlpha.value = 1;
    m.uniforms.outlineWidth.value = 1;
    return new Mesh(TEXT_GEOMETRY, m)
  },
  reset: (m) => {
    m.material.uniforms.tex.value = void 0;
  }
}


MeshFactory.register(SmallTextMesh)