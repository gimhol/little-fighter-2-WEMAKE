import { clamp, Entity, get_team_outline_color, get_team_text_color, round } from "@/LF2";
import { WorldRenderer } from "./WorldRenderer";
import { SmallTextMesh } from "./meshs/SmallTextMesh";

export class EntityNameRender {
  protected _mesh: SmallTextMesh | null = null;
  protected readonly world_renderer: WorldRenderer;
  protected entity: Entity;
  protected get mesh() {
    if (this._mesh) return this._mesh;
    const ret = this._mesh = SmallTextMesh.get()
    ret.name = `EntityNameRender_${this.entity.name}_${this.entity.id}`;
    this.world_renderer.world_node.add(ret)
    return ret
  }
  constructor(entity: Entity, world_renderer: WorldRenderer) {
    this.world_renderer = world_renderer;
    this.entity = entity;
  }
  on_mount() { }
  on_unmount() {
    this._mesh?.removeFromParent();
    this._mesh = null
  }
  render() {
    const { entity: e } = this;
    const { name } = e;
    if (!name) { // 无名，移除之
      this._mesh?.removeFromParent()
      this._mesh = null;
      return;
    }
    const { name_visible, invisible } = e;
    if (!name_visible || invisible) { // 不可见
      if (this._mesh) this._mesh.visible = false;
      return;
    }
    const { lf2, team, position, ground_y, world } = e;
    const { mesh } = this;
    mesh.set_text(lf2, name)
    mesh.visible = true;
    if (mesh.userData.team != team) {
      mesh.userData.team = team;
      mesh.fillStyle = get_team_text_color(team);
      mesh.strokeStyle = get_team_outline_color(team);
    }
    const hw = (mesh.scale.x + 10) / 2;
    const min_x = this.world_renderer.cam_x + hw;
    const max_x = min_x + world.screen_w - 2 * hw;
    const x = clamp(position.x, min_x, max_x);
    const z = position.z;
    const y = ground_y - z / 2 - mesh.scale.y;
    mesh.position.set(round(x), round(y), round(z));
  }

}
