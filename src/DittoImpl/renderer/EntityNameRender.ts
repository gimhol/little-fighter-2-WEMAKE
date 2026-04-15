import { Entity, get_team_shadow_color, get_team_text_color, IEntityCallbacks, round } from "@/LF2";
import * as T from "../_t";
import { WorldRenderer } from "./WorldRenderer";

export class EntityNameRender {
  protected name_node: T.Sprite;
  protected world_renderer: WorldRenderer;
  protected entity: Entity;
  protected cbs: IEntityCallbacks = {
    on_name_changed: () => this.update_name_sprite(),
    on_team_changed: () => this.update_name_sprite(),
  }
  constructor(entity: Entity, world_renderer: WorldRenderer) {
    this.world_renderer = world_renderer;
    this.name_node = new T.Sprite();
    this.name_node.name = `EntityNameRender_${entity.data.base.name}_${entity.id}`;
    this.entity = entity;
  }
  on_mount() {
    const { entity: e } = this;
    e.callbacks.add(this.cbs);
    this.name_node.visible = e.name_visible;
    this.world_renderer.world_node.add(this.name_node);
    this.update_name_sprite()
  }
  on_unmount() {
    const { entity: e } = this;
    this.name_node.removeFromParent();
    e.callbacks.del(this.cbs);
  }
  render() {
    const { invisible, position, name_visible, ground_y } = this.entity;
    this.name_node.visible = name_visible && !invisible

    let x = position.x
    const z = position.z
    const y = ground_y - z / 2 - this.name_node.scale.y;
    const hw = (this.name_node.scale.x + 10) / 2;
    const min_x = this.world_renderer.cam_x;
    const max_x = min_x + this.entity.world.screen_w;
    if (x + hw > max_x) x = max_x - hw;
    else if (x - hw < min_x) x = min_x + hw;
    this.name_node.position.set(round(x), round(y), round(z));
  }
  private update_name_sprite() {
    const { entity: e } = this;
    const sprite = this.name_node
    const { team, name } = e;
    const fillStyle = get_team_text_color(team);
    const strokeStyle = get_team_shadow_color(team);
    const world = e.world;
    const lf2 = world.lf2;
    if (!name) {
      sprite.visible = false;
      sprite.material.map?.dispose();
      sprite.material.map = null;
      sprite.material.needsUpdate = true
      return;
    }
    sprite.userData.text = name
    lf2.images.load_text(name, {
      fill_style: fillStyle,
      back_style: {
        stroke_style: strokeStyle,
        line_width: 2
      },
      disposable: true,
      smoothing: false,
    }).then((p) => {
      if (sprite.userData.text !== name) return;
      sprite.visible = true;
      sprite.material.map?.dispose();
      sprite.material.dispose();
      sprite.material = new T.SpriteMaterial({ map: p.pic?.texture })
      sprite.material.needsUpdate = true;
      sprite.scale.x = p.w / p.scale;
      sprite.scale.y = p.h / p.scale;
      sprite.name = "name sprite";
    });
  }

}
