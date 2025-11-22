import type { Background } from "../../LF2/bg/Background";
import { Defines } from "../../LF2/defines";
import type { World } from "../../LF2/World";
import * as T from "../_t";
import { BgLayerRender } from "./BgLayerRender";
import { WorldRenderer } from "./WorldRenderer";

export class BgRender {
  readonly world: World;
  protected bg: Background | null = null;
  protected object = new T.Object3D();
  protected layers: BgLayerRender[] = [];
  protected quaternion = new T.Quaternion();

  readonly world_renderer: WorldRenderer

  constructor(world_renderer: WorldRenderer) {
    if (!world_renderer) debugger;
    this.world = world_renderer.world;
    this.world_renderer = world_renderer;
  }

  set_bg(bg: Background | null) {
    this.object?.removeFromParent();
    this.bg = bg;
    if (this.bg) {
      this.object.position.z = -2 * Defines.CLASSIC_SCREEN_HEIGHT;
      this.object.name = "Background:" + this.bg.data.base.name;
      this.layers.length = 0;

      for (const layer of this.bg.layers) {
        const layer_render = new BgLayerRender(layer)
        this.layers.push(layer_render);
        this.object.add(layer_render.mesh);
      }
      this.world_renderer.scene.inner.add(this.object);
    }
  }

  render() {
    if (this.bg !== this.world.bg)
      this.set_bg(this.world.bg)

    const { object: mesh, layers } = this;
    this.world_renderer.camera.getWorldQuaternion(this.quaternion);

    mesh?.setRotationFromQuaternion(this.quaternion);
    for (const layer of layers) layer.render();
  }

  release() {
    this.object?.removeFromParent();
  }
}
