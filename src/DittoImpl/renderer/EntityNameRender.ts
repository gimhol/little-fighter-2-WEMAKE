import { clamp, Entity, get_team_outline_color, get_team_text_color, IEntityCallbacks, IStyle, round } from "@/LF2";
import * as T from "../_t";
import { get_geometry } from "./GeometryKeeper";
import { WorldRenderer } from "./WorldRenderer";
import { SmallTextMesh } from "./meshs/SmallTextMesh";

export class EntityNameRender {
  protected readonly mesh: SmallTextMesh;
  protected readonly world_renderer: WorldRenderer;
  protected readonly cbs: IEntityCallbacks = {
    on_name_changed: () => this.update_name_texture(),
    on_team_changed: () => this.update_name_texture(),
  }
  protected entity: Entity;
  constructor(entity: Entity, world_renderer: WorldRenderer) {
    this.world_renderer = world_renderer;
    this.entity = entity;
    this.mesh = SmallTextMesh.get()
    this.mesh.name = `EntityNameRender_${entity.data.base.name}_${entity.id}`;
  }
  on_mount() {
    const { entity: e } = this;
    e.callbacks.add(this.cbs);
    this.mesh.visible = e.name_visible;
    this.world_renderer.world_node.add(this.mesh);
    this.update_name_texture()
  }
  on_unmount() {
    const { entity: e } = this;
    this.mesh.removeFromParent();
    e.callbacks.del(this.cbs);
  }
  render() {
    const { mesh, entity: { invisible, position, name_visible, ground_y, world } } = this;
    const visible = mesh.visible = name_visible && !invisible && !!mesh.userData.text
    if (!visible) return;
    const hw = (mesh.scale.x + 10) / 2;
    const min_x = this.world_renderer.cam_x + hw;
    const max_x = min_x + world.screen_w - 2 * hw;
    const x = clamp(position.x, min_x, max_x);
    const z = position.z;
    const y = ground_y - z / 2 - mesh.scale.y;
    mesh.position.set(round(x), round(y), round(z));
  }
  private update_name_texture() {
    const { entity: { team, name, lf2 }, mesh } = this;
    const what = `${name}_${team}`
    if (mesh.userData.what == what)
      return;
    mesh.userData.what = what
    mesh.userData.text = name
    if (!name.length)
      return;
    mesh.set_text(lf2, name).then(() => {
      if (mesh.userData.what !== what) return;
      mesh.visible = true;
      mesh.fillStyle = get_team_text_color(team);
      mesh.strokeStyle = get_team_outline_color(team);
    }).catch(e => console.warn(e));
  }

}
