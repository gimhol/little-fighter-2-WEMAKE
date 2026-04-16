import { clamp, Entity, get_team_outline_color, get_team_text_color, IEntityCallbacks, IStyle, round } from "@/LF2";
import * as T from "../_t";
import { get_geometry } from "./GeometryKeeper";
import { MaterialFactory, MaterialKind } from "./MaterialFactory";
import { WorldRenderer } from "./WorldRenderer";
const TEXT_GEOMETRY = get_geometry(1, 1);
const TEXT_STYLE: IStyle = {
  fill_style: 'white',
  disposable: true,
  smoothing: false,
  scale: 1,
}
export class EntityNameRender {
  protected readonly mesh: T.Mesh<T.BufferGeometry, T.ShaderMaterial>;
  protected readonly world_renderer: WorldRenderer;
  protected readonly cbs: IEntityCallbacks = {
    on_name_changed: () => this.update_name_texture(),
    on_team_changed: () => this.update_name_texture(),
  }
  protected entity: Entity;
  constructor(entity: Entity, world_renderer: WorldRenderer) {
    this.world_renderer = world_renderer;
    this.entity = entity;
    const m = MaterialFactory.get(MaterialKind.Outline, T.ShaderMaterial);
    m.uniforms.mixStreath.value = 1;
    m.uniforms.outlineAlpha.value = 1;
    m.uniforms.outlineWidth.value = 1;
    this.mesh = new T.Mesh(TEXT_GEOMETRY, m)
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
    lf2.images.load_text(name, TEXT_STYLE).then((p) => {
      if (mesh.userData.what !== what) return;
      mesh.visible = true;
      const fillStyle = get_team_text_color(team);
      const strokeStyle = get_team_outline_color(team);
      const { uniforms } = mesh.material
      uniforms.tex.value = p.pic?.texture
      uniforms.mixColor.value = new T.Color(fillStyle);
      uniforms.outlineColor.value = new T.Color(strokeStyle);
      mesh.material.needsUpdate = true;
      mesh.scale.x = p.w / p.scale;
      mesh.scale.y = p.h / p.scale;
    }).catch(e => console.warn(e));
  }

}
