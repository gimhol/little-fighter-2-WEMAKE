import * as T from "../_t";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import type { IUINodeRenderer } from "@/LF2/ditto/render/IUINodeRenderer";
import { IImageInfo } from "@/LF2/loader/IImageInfo";
import { white_texture } from "./white_texture";
import { empty_texture } from "./empty_texture";
import { TextInput } from "@/LF2/ui/component/TextInput";
import { IUIImgInfo } from "@/LF2/ui/IUIImgInfo.dat";
import type { UINode } from "@/LF2/ui/UINode";
import { get_alpha_from_color } from "@/LF2/ui/utils/get_alpha_from_color";
import { is_num, is_str } from "@/LF2/utils";
import styles from "./ui_node_style.module.scss";
import type { WorldRenderer } from "./WorldRenderer";
export interface ISpriteInfo {
  w: number;
  h: number;
  texture?: any;
  color?: string;
}
export class UINodeRenderer implements IUINodeRenderer {
  sprite: T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial>;
  ui: UINode;

  protected _css_obj: CSS2DObject | undefined;
  protected _dom: HTMLDivElement | undefined;
  protected _ui_img?: IUIImgInfo;
  protected _geo: T.PlaneGeometry = new T.PlaneGeometry();
  protected _info: ISpriteInfo = { w: 0, h: 0 };
  protected _rgba: [number, number, number, number] = [255, 255, 255, 1];
  protected _texture: T.Texture = empty_texture();

  protected get dom() {
    if (this._dom) return this._dom;
    this._dom = document.createElement('div');
    this._dom.className = styles.ui_node_style
    this._css_obj = new CSS2DObject(this._dom);
    this._css_obj.position.set(0, 0, 0);
    this._css_obj.center.set(0, 1);

    const txt = this.ui.txts.value[this.ui.txt_idx.value]
    if (txt?.style.font) this.dom.style.font = txt.style.font;
    if (txt?.style.fill_style) this.dom.style.color = txt.style.fill_style;
    this.sprite.add(this._css_obj);
    return this._dom;
  }
  protected release_dom() {
    if (!this._css_obj) return;
    this.sprite.remove(this._css_obj);
    delete this._css_obj;
    delete this._dom;
  }
  protected hide_dom() {
    if (!this._css_obj) return;
    if (!this._css_obj.parent) return;
    this.sprite.remove(this._css_obj);
  }
  protected show_dom() {
    if (!this._css_obj) return;
    if (this._css_obj.parent) return;
    this.sprite.add(this._css_obj);
  }

  get world() { return this.ui.lf2.world }
  get lf2() { return this.ui.lf2 }
  get parent() { return this.ui.renderer }
  img_idx = -1
  constructor(ui: UINode) {
    this.ui = ui;
    this.sprite = new T.Mesh(
      this.next_geometry(),
      new T.MeshBasicMaterial({ transparent: true, opacity: 1 }),
    )
    this.sprite.userData.owner = ui;
  }
  del(child: UINodeRenderer) {
    this.sprite.remove(child.sprite)
  }
  add(child: UINodeRenderer) {
    this.sprite.add(child.sprite)
  }
  del_self() {
    this.sprite.removeFromParent();
  }
  on_resume(): void {
    const world_renderer = this.lf2.world.renderer as WorldRenderer;
    if (this.ui.root === this.ui) world_renderer.scene.inner.add(this.sprite);
    const text_input = this.ui.find_component(TextInput)
    if (text_input) {
      const ele_input = document.createElement('input');
      const { maxLength, defaultValue, text } = text_input
      if (is_num(maxLength)) ele_input.maxLength = maxLength
      else ele_input.removeAttribute('maxLength')
      if (is_str(defaultValue)) ele_input.defaultValue = defaultValue
      else ele_input.removeAttribute('defaultValue')
      ele_input.value = text
      ele_input.onchange = () => text_input.text = ele_input.value
      this.dom.appendChild(ele_input)
    }
  };

  on_pause(): void {
    const text_input = this.ui.find_component(TextInput)
    if (text_input) this.release_dom()
  };
  on_show(): void { };
  on_hide(): void { };
  on_start() {
    const [x, y, z] = this.ui.pos.value;
    const [c_x, c_y, c_z] = this.ui.center.value
    this._c_x = c_x;
    this._c_y = c_y;
    this._c_z = c_z;

    this.sprite.position.set(x, -y, z)
    this.sprite.visible = this.ui.visible;
    this.sprite.name = `layout(name= ${this.ui.name}, id=${this.ui.id})`
    this.apply();
    this.ui.parent?.renderer.add(this);
  }
  on_stop() {
    this.parent?.del(this);
    this.release_dom();
  }

  apply() {
    const { sprite: sp } = this;
    sp.geometry = this.next_geometry();
    const {
      _texture,
      _rgba: [_r, _g, _b, _a],
    } = this;
    if (sp.material.map !== _texture) {
      sp.material.map?.dispose();
      sp.material.map = _texture;
      sp.material.needsUpdate = true;
    }
    const { r, g, b } = sp.material.userData;
    if (r !== _r || g !== _g || b !== _b) {
      sp.material.color = new T.Color(_r / 255, _g / 255, _b / 255);
      sp.material.userData.r = _r;
      sp.material.userData.g = _g;
      sp.material.userData.b = _b;
      sp.material.needsUpdate = true;
    }
    return this;
  }

  update_sprite() {
    if (
      !this.ui.img_idx.dirty &&
      !this.ui.imgs.dirty &&
      !this.ui.txt_idx.dirty &&
      !this.ui.txts.dirty &&
      !this.ui.size.dirty &&
      !this.ui.color.dirty
    ) return;
    const img =
      this.ui.imgs.value[this.ui.img_idx.value] ||
      this.ui.txts.value[this.ui.txt_idx.value];

    this._ui_img = this.ui.data.img[this.ui.img_idx.value]
    this.create_sprite_info(img).then(p => {
      this.set_info(p)
      this.apply()
    });
  }

  set_info(info: ISpriteInfo): this {
    this._info = info;
    const a = get_alpha_from_color(info.color) || 1
    const { r, g, b } = new T.Color(info.color);
    this._rgba = [Math.ceil(r * 255), Math.ceil(g * 255), Math.ceil(b * 255), a];
    this._texture = info.texture || empty_texture();
    return this;
  }

  async create_sprite_info(img: IImageInfo | undefined): Promise<ISpriteInfo> {
    const [w, h] = this.ui.size.value;
    const color = this.ui.color.value
    const texture = img ? await this.create_texture(img) : color ? white_texture() : empty_texture();
    const p: ISpriteInfo = { w, h, texture, color: color };
    return p;
  }

  protected async create_texture(img: IImageInfo): Promise<T.Texture> {
    const { texture } = await this.lf2.images.create_pic_by_img_info(img);
    return texture;
  }

  get x(): number { return this.sprite.position.x }
  set x(v: number) { this.sprite.position.x = v; }
  get y(): number { return this.sprite.position.y }
  set y(v: number) { this.sprite.position.y = v; }
  get visible() {
    return this.sprite.visible
  }
  set visible(v: boolean) {
    this.sprite.visible = v
    v ? this.show_dom() : this.hide_dom()
  }
  protected _c_x: number = 0;
  protected _c_y: number = 0;
  protected _c_z: number = 0;
  protected w: number = 0;
  protected h: number = 0;

  protected next_geometry(): T.PlaneGeometry {
    const { w, h, _c_x, _c_y, _c_z } = this;
    const { w: _w, h: _h, c_x, c_y, c_z } = this._geo.userData;

    if (w === _w && h === _h && c_x === _c_x && c_y === _c_y && c_z === _c_z)
      return this._geo;
    this._geo.dispose();

    const tran_x = Math.round(w * (0.5 - _c_x));
    const tran_y = Math.round(h * (_c_y - 0.5));
    const tran_z = Math.round(_c_z);
    const ret = new T.PlaneGeometry(w, h).translate(tran_x, tran_y, tran_z);
    ret.userData.w = w;
    ret.userData.h = h;
    ret.userData.c_x = _c_x;
    ret.userData.c_y = _c_y;
    return (this._geo = ret);
  }

  render(dt: number) {
    if (this.ui.center.dirty || this.ui.size.dirty) {
      this.ui.center.dirty = this.ui.size.dirty = false
      const [w, h] = this.ui.size.value;
      const [x, y, z] = this.ui.center.value
      this.w = w;
      this.h = h;
      this._c_x = x;
      this._c_y = y;
      this._c_z = z;
      this.apply();

      if (this._dom) {
        this._dom.style.width = `${w}px`
        this._dom.style.height = `${h}px`
      }
      this._css_obj?.center.set(x, y)
    }
    this.update_sprite();
    this.ui.scale.dirty && this.sprite.scale.set(...this.ui.scale.value);

    const sp = this.sprite;
    if (sp && this._ui_img) {
      const t = sp.material.map;
      if (t) {
        const { wrapS, wrapT, offsetAnimX, offsetAnimY, repeatX, repeatY } = this._ui_img
        if (offsetAnimX !== void 0) t.offset.y += (dt / 1000) * offsetAnimX;
        if (offsetAnimY !== void 0) t.offset.x += (dt / 1000) * offsetAnimY;
        if (wrapS !== void 0) t.wrapS = (wrapS as any)
        if (wrapT !== void 0) t.wrapT = (wrapT as any)
        if (repeatX !== void 0) t.repeat.setX(repeatX)
        if (repeatY !== void 0) t.repeat.setY(repeatY)
        t.needsUpdate = true
      }
    }
    if (this.ui.pos.dirty) {
      const [x, y, z] = this.ui.pos.value
      sp.position.set(x, -y, z);
    }
    sp.visible = this.ui.visible
    const opacity = this.ui.global_opacity

    const { material: m } = sp;
    m.opacity = this.ui.global_opacity * this._rgba[3];
    m.needsUpdate = true;
    if (this._dom) this._dom.style.opacity = '' + opacity

    this.apply()

    for (const child of this.ui.children)
      if (child.visible !== child.renderer.visible || child.renderer.visible)
        child.renderer.render(dt)
  }
}
