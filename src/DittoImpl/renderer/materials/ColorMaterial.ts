import { Color, MeshBasicMaterial } from "../../_t";
import { MaterialFactory, MaterialKind } from "../factory/MaterialFactory";

MaterialFactory.register({
  kind: MaterialKind.Color,
  cls: MeshBasicMaterial,
  create: (): MeshBasicMaterial => {
    return new MeshBasicMaterial({ visible: true, color: 0 })
  },
  reset: (c: MeshBasicMaterial): void => {
    c.setValues({ visible: true, color: 0 })
  }
})

MaterialFactory.register({
  kind: MaterialKind.Red,
  cls: MeshBasicMaterial,
  create: (): MeshBasicMaterial => {
    return new MeshBasicMaterial({ visible: true, color: new Color(1, 0, 0) })
  },
  reset: (c: MeshBasicMaterial): void => {
    c.setValues({ visible: true, color: new Color(1, 0, 0) })
  }
})