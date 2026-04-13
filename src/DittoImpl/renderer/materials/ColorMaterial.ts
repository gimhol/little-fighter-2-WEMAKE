import { MeshBasicMaterial } from "../../_t";
import { MaterialFactory, MaterialKind } from "../MaterialFactory";

MaterialFactory.register(MaterialKind.Color, {
  cls: MeshBasicMaterial,
  create: (): MeshBasicMaterial => {
    return new MeshBasicMaterial({ visible: true, color: 0 })
  },
  reset: (c: MeshBasicMaterial): void => {
    c.setValues({ visible: true, color: 0 })
  }
})