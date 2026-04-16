import { get_team_outline_color } from "@/LF2/base/get_team_shadow_color";
import { get_team_text_color } from "@/LF2/base/get_team_text_color";
import { GameKey, GameKeyLabels, IStyle, IVector3 } from "@/LF2/defines";
import { is_fighter, type Entity, type IEntityCallbacks } from "@/LF2/entity";
import { StatBarType } from "@/LF2/entity/StatBarType";
import { floor } from "@/LF2/utils";
import * as T from "../_t";
import { Bar } from "./Bar";
import { get_geometry } from "./GeometryKeeper";
import { INDICATINGS } from "./INDICATINGS";
import { MaterialFactory, MaterialKind } from "./MaterialFactory";
import { WorldRenderer } from "./WorldRenderer";

const BAR_W = 40;
const BAR_H = 3;
const BAR_BG_W = BAR_W + 2;
const BAR_BG_H = 1 + (BAR_H + 1) * 2 + 4;
const TEXT_GEOMETRY = get_geometry(1, 1);
const TEXT_STYLE: IStyle = {
  fill_style: 'white',
  disposable: true,
  smoothing: false,
  scale: 1,
}
export class EntityStatRender implements IEntityCallbacks {
  protected _reserve_mesh: T.Mesh<T.BufferGeometry, T.ShaderMaterial> | null = null;
  protected bars_node = new T.Object3D();
  protected ctrl_node = new T.Object3D();
  protected bars_bg: Bar;

  protected self_healing_hp_bar: Bar;
  protected hp_bar: Bar;

  protected self_healing_mp_bar: Bar;
  protected mp_bar: Bar;

  protected fall_value_bar: Bar;
  protected defend_value_bar: Bar;
  protected toughness_value_bar: Bar;

  entity: Entity;

  protected key_nodes: Map<GameKey, { node: T.Sprite, pos: IVector3 }>
  world_renderer: WorldRenderer;
  protected _heading: boolean = false;

  private get reserve_mesh(): T.Mesh<T.BufferGeometry, T.ShaderMaterial> {
    if (this._reserve_mesh) return this._reserve_mesh;
    const m = MaterialFactory.get(MaterialKind.Outline, T.ShaderMaterial);
    m.uniforms.mixStreath.value = 1;
    m.uniforms.outlineAlpha.value = 1;
    m.uniforms.outlineWidth.value = 1;
    const ret = this._reserve_mesh = new T.Mesh(TEXT_GEOMETRY, m)
    ret.name = `reserve_mesh_${this.entity.name}_${this.entity.id}`;
    this.world_renderer.world_node.add(ret)
    return ret
  }
  constructor(entity: Entity, world_renderer: WorldRenderer) {
    this.world_renderer = world_renderer;
    const { lf2 } = entity.world;
    const f = 7;
    this.key_nodes = new Map([
      [GameKey.U, { node: new T.Sprite(), pos: new T.Vector3(f * (-2 + 0.5), f * 2, 0) }],
      [GameKey.D, { node: new T.Sprite(), pos: new T.Vector3(f * (-2 + 0.5), f * 0, 0) }],
      [GameKey.L, { node: new T.Sprite(), pos: new T.Vector3(f * (-3 + 0.5), f * 1, 0) }],
      [GameKey.R, { node: new T.Sprite(), pos: new T.Vector3(f * (-1 + 0.5), f * 1, 0) }],
      [GameKey.a, { node: new T.Sprite(), pos: new T.Vector3(f * (1 - 0.5), f * 0, 0) }],
      [GameKey.j, { node: new T.Sprite(), pos: new T.Vector3(f * (2 - 0.5), f * 1, 0) }],
      [GameKey.d, { node: new T.Sprite(), pos: new T.Vector3(f * (3 - 0.5), f * 2, 0) }],
    ])

    this.bars_bg = new Bar(lf2, "rgb(0,0,0)", BAR_BG_W, BAR_BG_H, 0.5, 0);
    this.self_healing_hp_bar = new Bar(
      lf2,
      "rgb(111,8,31)",
      BAR_W,
      BAR_H,
      0.5,
      1,
    );
    this.hp_bar = new Bar(lf2, "rgb(255,0,0)", BAR_W, BAR_H, 0.5, 1);

    this.self_healing_mp_bar = new Bar(
      lf2,
      "rgb(31,8,111)",
      BAR_W,
      BAR_H,
      0.5,
      1,
    );
    this.mp_bar = new Bar(lf2, "rgb(0,0,255)", BAR_W, BAR_H, 0.5, 1);

    this.fall_value_bar = new Bar(lf2, "rgb(216, 115, 0)", BAR_W, 1, 0.5, 1);
    this.defend_value_bar = new Bar(lf2, "rgb(0, 122, 71)", BAR_W, 1, 0.5, 1);
    this.toughness_value_bar = new Bar(lf2, "rgba(0, 204, 255, 1)", BAR_W, 1, 0.5, 1);
    this.entity = entity;

    let y = -1;
    this.bars_bg.mesh.position.x = -1;
    this.bars_bg.mesh.position.y = -2;
    this.bars_node.add(this.bars_bg.mesh);

    this.self_healing_hp_bar.mesh.position.set(0, y, 0);
    this.self_healing_hp_bar.set(entity.hp, entity.hp_max);
    this.bars_node.add(this.self_healing_hp_bar.mesh);

    this.hp_bar.mesh.position.set(0, y, 0);
    this.hp_bar.set(entity.hp, entity.hp_max);
    this.bars_node.add(this.hp_bar.mesh);
    y = y - 1 - BAR_H;

    this.self_healing_mp_bar.mesh.position.set(0, y, 0);
    this.self_healing_mp_bar.set(entity.mp, entity.mp_max);
    this.bars_node.add(this.self_healing_mp_bar.mesh);

    this.mp_bar.mesh.position.set(0, y, 0);
    this.mp_bar.set(entity.mp, entity.mp_max);
    this.bars_node.add(this.mp_bar.mesh);

    y = y - 1;
    this.fall_value_bar.mesh.position.set(0, y, 0);
    this.fall_value_bar.set(entity.fall_value, entity.fall_value_max);
    this.bars_node.add(this.fall_value_bar.mesh);

    y = y - 2;
    this.defend_value_bar.mesh.position.set(0, y, 0);
    this.defend_value_bar.set(entity.defend_value, entity.defend_value_max);
    this.bars_node.add(this.defend_value_bar.mesh);

    this.toughness_value_bar.mesh.position.set(0, y, 0);
    this.toughness_value_bar.set(entity.toughness, entity.toughness_max);
    this.bars_node.add(this.toughness_value_bar.mesh);

    for (const [k, { node: sprite, pos }] of this.key_nodes) {
      sprite.name = `key ${k}`;
      sprite.position.set(BAR_BG_W / 2 + pos.x, 10 + pos.y, pos.z)
      lf2.images
        .load_text(GameKeyLabels[k], {
          fill_style: 'white',
          line_width: 0,
          smoothing: false,
          font: "bold 12px Arial",
          back_style: {
            fill_style: '',
            stroke_style: 'black',
            line_width: 2,
            smoothing: false,
            font: "bold 12px Arial",
          },
        })
        .then((p) => {
          sprite.material.map?.dispose();
          sprite.material.dispose();
          sprite.material = new T.SpriteMaterial({ map: p.pic?.texture })
          sprite.material.needsUpdate = true;
          sprite.scale.x = p.w / p.scale;
          sprite.scale.y = p.h / p.scale;
        });
      this.ctrl_node.add(sprite)
    }

  }

  on_mount() {
    const { entity: e } = this;
    e.callbacks.add(this);
    this.world_renderer.world_node.add(
      this.bars_node, this.ctrl_node
    );
    this.bars_node.visible = e.key_role
    this.ctrl_node.visible = false
    this.on_hp_changed(e)
    this.on_hp_max_changed(e)
    this.on_mp_changed(e)
    this.on_mp_max_changed(e)
    this.on_hp_r_changed(e)
    this.on_fall_value_changed(e)
    this.on_fall_value_max_changed(e)
    this.on_defend_value_changed(e)
    this.on_defend_value_max_changed(e)
    this.on_toughness_changed(e)
    this.on_toughness_max_changed(e)
  }

  on_unmount() {
    const { entity: e } = this;
    this.bars_node.removeFromParent();
    this.ctrl_node.removeFromParent();
    this._reserve_mesh?.removeFromParent();
    e.callbacks.del(this);
  }
  on_hp_changed(e: Entity): void { this.hp_bar.val = e.hp; }
  on_hp_max_changed(e: Entity): void { this.self_healing_hp_bar.max = e.hp_max; this.hp_bar.max = e.hp_max; }
  on_hp_r_changed(e: Entity): void { this.self_healing_hp_bar.val = e.hp_r; }
  on_mp_changed(e: Entity): void { this.mp_bar.val = e.mp; }
  on_mp_max_changed(e: Entity): void { this.self_healing_mp_bar.max = e.mp_max; }
  on_fall_value_changed(e: Entity): void { this.fall_value_bar.val = e.fall_value; }
  on_fall_value_max_changed(e: Entity): void { this.fall_value_bar.max = e.fall_value_max; }
  on_defend_value_changed(e: Entity): void { this.defend_value_bar.val = e.defend_value; }
  on_defend_value_max_changed(e: Entity): void { this.defend_value_bar.max = e.defend_value_max; }
  on_toughness_changed(e: Entity): void { this.toughness_value_bar.val = e.toughness; }
  on_toughness_max_changed(e: Entity): void { this.toughness_value_bar.max = e.toughness_max; }

  private update_reverse(e: Entity) {
    const { invisible } = e;
    if (invisible) {
      if (this._reserve_mesh) {
        this._reserve_mesh.visible = false;
      }
      return;
    }
    const { reserve } = e;
    if (!reserve) {
      this._reserve_mesh?.removeFromParent()
      this._reserve_mesh = null;
      return;
    }
    const { lf2, team } = e;
    const mesh = this.reserve_mesh;
    const what = `${reserve}_${team}`
    if (mesh.userData.what != what) {
      mesh.userData.what = what
      lf2.images.load_text(`x${reserve}`, TEXT_STYLE).then((p) => {
        if (mesh.userData.what !== what) return;
        const { uniforms } = mesh.material
        const fillStyle = get_team_text_color(team);
        const strokeStyle = get_team_outline_color(team);
        uniforms.tex.value = p.pic?.texture
        uniforms.mixColor.value = new T.Color(fillStyle);
        uniforms.outlineColor.value = new T.Color(strokeStyle);
        mesh.material.needsUpdate = true;
        mesh.scale.x = p.w / p.scale;
        mesh.scale.y = p.h / p.scale;
        mesh.visible = true;
      }).catch(e => console.warn(e));
    }

    const {
      position: { x, y, z },
      frame: { centery }
    } = e
    const _x = floor(x)
    const _y = floor(y - z / 2 + centery + mesh.scale.y / 2)
    const _z = floor(z)
    mesh.position.set(_x, _y, _z)
  }
  render() {
    const {
      invisible, position: { x, z, y }, frame: { centery }, hp, key_role,
      stat_bar_type
    } = this.entity;
    const _is_fighter = is_fighter(this.entity)
    this.bars_node.visible = !!(stat_bar_type & StatBarType.Float) && _is_fighter && key_role && !invisible && hp > 0;
    this.update_reverse(this.entity)

    if (this.entity.healing) {
      const heading = (this.entity.update_id.value % 8) < 4;
      if (this._heading != heading) {
        this.hp_bar.color = heading ? "rgb(255, 130, 130)" : "rgb(255,0,0)"
        this._heading = heading
      }
    } else if (this._heading) {
      this.hp_bar.color = "rgb(255,0,0)";
      this._heading = false;
    }

    const _x = floor(x);
    const bar_y = floor(y - z / 2 + BAR_BG_H + 5 + centery);
    const bar_x = floor(_x - BAR_BG_W / 2);
    const bar_z = floor(z);

    this.set_bars_position(bar_x, bar_y, bar_z);
    this.ctrl_node.visible = !!(this.entity.lf2.world.indicator_flags & INDICATINGS.ctrl);
    if (this.ctrl_node.visible) for (const [k, { node }] of this.key_nodes) {
      node.visible = !this.entity.ctrl.is_end(k)
    }
  }

  set_bars_position(x: number, y: number, z: number) {
    const old_y = this.bars_node.position.y
    const _y = y ?? old_y
    let __y = old_y === 0 ? _y : old_y + (_y - old_y) * 0.2

    this.bars_node.position.set(x, __y, z);
    if (!this.bars_node.parent) __y -= BAR_BG_H + 5

    this.ctrl_node.position.set(x, __y, z);
  }
}
