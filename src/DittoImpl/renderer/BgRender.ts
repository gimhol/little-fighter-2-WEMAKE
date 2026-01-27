import type { Background } from "@/LF2/bg/Background";
import { Defines } from "@/LF2/defines";
import type { World } from "@/LF2/World";
import * as T from "../_t";
import { BgLayerRender } from "./BgLayerRender";
import { WorldRenderer } from "./WorldRenderer";

export class BgRender {
  readonly world: World;
  protected bg: Background | null = null;
  protected obj_3d = new T.Object3D();
  protected layers: BgLayerRender[] = [];
  protected quaternion = new T.Quaternion();

  readonly world_renderer: WorldRenderer

  constructor(world_renderer: WorldRenderer) {
    if (!world_renderer) debugger;
    this.world = world_renderer.world;
    this.world_renderer = world_renderer;
  }

  set_bg(bg: Background | null) {
    this.obj_3d?.removeFromParent();

    this.bg = bg;
    if (this.bg) {
      this.obj_3d = new T.Object3D();
      this.obj_3d.position.z = -2 * Defines.CLASSIC_SCREEN_HEIGHT;
      this.obj_3d.name = "Background:" + this.bg.data.base.name;
      this.layers.length = 0;

      for (const layer of this.bg.layers) {
        const layer_render = new BgLayerRender(layer)
        this.layers.push(layer_render);
        this.obj_3d.add(layer_render.mesh);
      }
      this.world_renderer.world_node.add(this.obj_3d);
    }
  }

  render() {
    if (this.bg !== this.world.bg)
      this.set_bg(this.world.bg)

    const { obj_3d, layers } = this;
    this.world_renderer.camera.getWorldQuaternion(this.quaternion);

    obj_3d?.setRotationFromQuaternion(this.quaternion);
    for (const layer of layers) layer.render();
  }

  release() {
    this.obj_3d?.removeFromParent();
  }
}
