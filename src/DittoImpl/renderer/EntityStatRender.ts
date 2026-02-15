import { get_team_shadow_color } from "@/LF2/base/get_team_shadow_color";
import { get_team_text_color } from "@/LF2/base/get_team_text_color";
import { GameKey, IVector3, Labels } from "@/LF2/defines";
import { is_bot_ctrl, is_fighter, is_human_ctrl, type Entity, type IEntityCallbacks } from "@/LF2/entity";
import { floor, round } from "@/LF2/utils";
import * as T from "../_t";
import { Bar } from "./Bar";
import { WorldRenderer } from "./WorldRenderer";
import { INDICATINGS } from "./INDICATINGS";

const BAR_W = 40;
const BAR_H = 3;
const BAR_BG_W = BAR_W + 2;
const BAR_BG_H = 1 + (BAR_H + 1) * 2 + 4;
export class EntityStatRender implements IEntityCallbacks {
  protected reserve_node: T.Sprite;
  protected name_node: T.Sprite;
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

    this.name_node = new T.Sprite();
    this.name_node.name = EntityStatRender.name;
    this.name_node.renderOrder = 0;
    this.reserve_node = new T.Sprite();

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
        .load_text(Labels[k], {
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
    this.world_renderer.world_node.add(this.bars_node, this.name_node, this.ctrl_node, this.reserve_node);
    this.bars_node.visible = e.key_role
    this.name_node.visible = e.key_role
    this.ctrl_node.visible = false
    this.on_name_changed(e)
    this.on_reserve_changed(e)
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
    this.name_node.removeFromParent();
    this.ctrl_node.removeFromParent();
    this.reserve_node.removeFromParent();
    e.callbacks.del(this);
  }

  on_name_changed(e: Entity): void { this.update_name_sprite(e) }
  on_team_changed(e: Entity): void { this.update_name_sprite(e); this.update_reverse_sprite(e); }
  on_reserve_changed(e: Entity): void { this.update_reverse_sprite(e) }
  on_hp_changed(e: Entity): void { this.hp_bar.val = e.hp; }
  on_hp_max_changed(e: Entity): void { this.self_healing_hp_bar.max = e.hp_max; }
  on_mp_changed(e: Entity): void { this.mp_bar.val = e.mp; }
  on_mp_max_changed(e: Entity): void { this.self_healing_mp_bar.max = e.mp_max; }
  on_hp_r_changed(e: Entity): void { this.self_healing_hp_bar.val = e.hp_r; }
  on_fall_value_changed(e: Entity): void { this.fall_value_bar.val = e.fall_value; }
  on_fall_value_max_changed(e: Entity): void { this.fall_value_bar.max = e.fall_value_max; }
  on_defend_value_changed(e: Entity): void { this.defend_value_bar.val = e.defend_value; }
  on_defend_value_max_changed(e: Entity): void { this.defend_value_bar.max = e.defend_value_max; }
  on_toughness_changed(e: Entity): void { this.toughness_value_bar.val = e.toughness; }
  on_toughness_max_changed(e: Entity): void { this.toughness_value_bar.max = e.toughness_max; }
  private update_reverse_sprite(e: Entity) {
    const sprite = this.reserve_node
    const { team, reserve } = e;
    const fillStyle = get_team_text_color(team);
    const strokeStyle = get_team_shadow_color(team);
    const world = e.world;
    const lf2 = world.lf2;
    const text = reserve ? 'x' + reserve : void 0;
    if (!text) {
      sprite.visible = false;
      sprite.material.map?.dispose();
      sprite.material.map = null;
      sprite.material.needsUpdate = true
      return;
    }
    sprite.userData.text = text
    lf2.images.load_text(text, {
      fill_style: fillStyle,
      back_style: {
        stroke_style: strokeStyle,
        line_width: 2
      },
      smoothing: false,
    }).then((p) => {
      if (sprite.userData.text !== text)
        return;
      sprite.material.map?.dispose();
      sprite.material.dispose();
      sprite.material = new T.SpriteMaterial({ map: p.pic?.texture })
      sprite.material.needsUpdate = true;
      sprite.visible = true;
      sprite.name = "reserve sprite";
      sprite.scale.x = p.w / p.scale;
      sprite.scale.y = p.h / p.scale;
    });
  }
  private update_name_sprite(e: Entity) {
    const sprite = this.name_node
    const { key_role, ctrl, team } = e;
    let text = ' ';
    if (is_human_ctrl(ctrl)) {
      text = ctrl.player.name || ' '
    } else if (is_bot_ctrl(ctrl) && ctrl.player) {
      text = "com"
    } else if (key_role) {
      text = this.world_renderer.lf2.string(e.data.base.name)
    } else {
      text = 'com'
    }
    const fillStyle = get_team_text_color(team);
    const strokeStyle = get_team_shadow_color(team);
    const world = e.world;
    const lf2 = world.lf2;
    if (!text) {
      sprite.visible = false;
      sprite.material.map?.dispose();
      sprite.material.map = null;
      sprite.material.needsUpdate = true
      return;
    }
    sprite.userData.text = text
    lf2.images.load_text(text, {
      fill_style: fillStyle,
      back_style: {
        stroke_style: strokeStyle,
        line_width: 2
      },
      disposable: true,
      smoothing: false,
    }).then((p) => {
      if (sprite.userData.text !== text) return;
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
  render() {
    const {
      invisible, position: { x, z, y }, frame: { centery }, hp, key_role,
      has_stat_bar, ground
    } = this.entity;
    const gy = ground.get_y(x, y, z)
    const _is_fighter = is_fighter(this.entity)
    this.name_node.visible = _is_fighter && key_role && !invisible
    this.bars_node.visible = !has_stat_bar && _is_fighter && key_role && !invisible && hp > 0;

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

    const name_y = floor(gy - z / 2 - this.name_node.scale.y);
    this.set_name_position(_x, name_y, z);

    this.ctrl_node.visible = !!(this.entity.lf2.world.indicator_flags & INDICATINGS.ctrl);
    if (this.ctrl_node.visible) for (const [k, { node }] of this.key_nodes) {
      node.visible = !this.entity.ctrl.is_end(k)
    }
  }

  set_name_position(x: number, y: number, z: number) {
    const hw = (this.name_node.scale.x + 10) / 2;
    const { cam_x: cam_l } = this.entity.world.renderer;
    const cam_r = cam_l + this.entity.world.screen_w;
    if (x + hw > cam_r) x = cam_r - hw;
    else if (x - hw < cam_l) x = cam_l + hw;
    this.name_node.position.set(round(x), round(y), round(z));
  }

  set_bars_position(x: number, y: number, z: number) {
    const old_y = this.bars_node.position.y
    const _y = y ?? old_y
    let __y = old_y === 0 ? _y : old_y + (_y - old_y) * 0.2

    this.bars_node.position.set(x, __y, z);
    if (!this.bars_node.parent) __y -= BAR_BG_H + 5

    this.reserve_node.position.set(x + BAR_BG_W / 2, __y, z)
    this.ctrl_node.position.set(x, __y, z);
  }
}
