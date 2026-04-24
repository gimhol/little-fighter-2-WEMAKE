import type { Material } from "../../_t";
import { InstFactory, Kind } from "./InstFactory";
export enum MaterialKind {
  Invalid = 0,
  Outline = 'Outline',
  Color = 'Color',
  Image = 'Image',
  BgLayer = 'BgLayer',
  Text = "Text"
}
export const MaterialFactory = new class MaterialFactory extends InstFactory<Material> {
  override readonly TAG = 'MaterialFactory'
  override get_kind(inst: Material): Kind {
    return inst.userData.material_factory_kind;
  }
  override set_kind(inst: Material, kind: Kind): void {
    inst.userData.material_factory_kind = kind
  }
}