import { Color, ShaderMaterial } from "../../_t";
import { MaterialFactory, MaterialKind } from "../MaterialFactory";
import { Shaders } from "../shader";
export const BLACK = new Color("#000000");
MaterialFactory.register(MaterialKind.Outline, {
  cls: ShaderMaterial,
  create: () => {
    const ret = new ShaderMaterial({
      vertexShader: Shaders.Vertex.Normal,
      fragmentShader: Shaders.Fragment.Outline,
      transparent: true
    });
    return ret;
  },
  reset: (c: ShaderMaterial) => {
    c.uniforms = {
      pTexture: { value: void 0 },
      x: { value: 0 },
      y: { value: 0 },
      w: { value: 1 },
      h: { value: 1 },
      tw: { value: 1 },
      th: { value: 1 },
      tsw: { value: 1 },
      tsh: { value: 1 },
      outlineColor: { value: BLACK },
      outlineAlpha: { value: 0 },
      outlineWidth: { value: 0 },
      repeatX: { value: 1 },
      repeatY: { value: 1 },
      offsetX: { value: 0 },
      offsetY: { value: 0 },
      flipX: { value: 1 },
      flipY: { value: 1 },
      scaleX: { value: 1 },
      scaleY: { value: 1 },
      scaleZ: { value: 1 },
      opacity: { value: 1 },
      mixColor: { value: BLACK },
      mixStreath: { value: 0 },
      cover: { value: false },
      coverColor: { value: BLACK },
      coverStreath: { value: 0 },
      gray: { value: 0 },
      keepout: { value: true }
    }
  }
})