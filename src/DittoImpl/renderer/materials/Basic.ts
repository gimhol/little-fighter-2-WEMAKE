import { MeshBasicMaterial } from "../../_t";
import { MaterialFactory, MaterialKind } from "../factory/MaterialFactory";

MaterialFactory.register({
  kind: MaterialKind.Basic,
  cls: MeshBasicMaterial,
  create: (): MeshBasicMaterial => {
    return new MeshBasicMaterial({
      transparent: true,
      opacity: 0
    })
  },
  reset: (c: MeshBasicMaterial): void => {
    c.setValues({
      transparent: true,
      opacity: 0
    })
  }
})