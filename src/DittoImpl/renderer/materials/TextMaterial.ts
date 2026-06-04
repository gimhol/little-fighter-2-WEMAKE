import { ShaderMaterial } from "../../_t";
import { MaterialFactory, MaterialKind } from "../factory/MaterialFactory";
import { Shaders } from "../shader";
import { BLACK } from "./OutlineMaterial";
MaterialFactory.register({
  kind: MaterialKind.Text,
  cls: ShaderMaterial,
  create: () => {
    const ret = new ShaderMaterial({
      vertexShader: Shaders.Vertex.Normal,
      fragmentShader: Shaders.Fragment.Text,
      transparent: true,
      uniforms: {
        tex: { value: void 0 },
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
        /** 混色 */
        mixColor: { value: BLACK.clone() },
        /** 混色强度,一般范围:[0,1], 当为0，不混色 */
        mixStength: { value: 0 },
        cover: { value: false },
        coverColor: { value: BLACK.clone() },
        coverStength: { value: 0 },
        gray: { value: 0 },
        keepout: { value: true }
      }
    });
    return ret;
  },
  reset: (c: ShaderMaterial) => {
    c.uniforms.tex.value = void 0
    c.uniforms.x.value = 0
    c.uniforms.y.value = 0
    c.uniforms.w.value = 1
    c.uniforms.h.value = 1
    c.uniforms.tw.value = 1
    c.uniforms.th.value = 1
    c.uniforms.tsw.value = 1
    c.uniforms.tsh.value = 1
    c.uniforms.outlineColor.value.set(BLACK)
    c.uniforms.outlineAlpha.value = 0
    c.uniforms.outlineWidth.value = 0
    c.uniforms.repeatX.value = 1
    c.uniforms.repeatY.value = 1
    c.uniforms.offsetX.value = 0
    c.uniforms.offsetY.value = 0
    c.uniforms.flipX.value = 1
    c.uniforms.flipY.value = 1
    c.uniforms.scaleX.value = 1
    c.uniforms.scaleY.value = 1
    c.uniforms.scaleZ.value = 1
    c.uniforms.opacity.value = 1
    c.uniforms.mixColor.value.set(BLACK)
    c.uniforms.mixStength.value = 0
    c.uniforms.cover.value = false
    c.uniforms.coverColor.value.set(BLACK)
    c.uniforms.coverStength.value = 0
    c.uniforms.gray.value = 0
    c.uniforms.keepout.value = true
  }
})