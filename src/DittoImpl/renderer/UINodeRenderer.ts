import { ImageInfo } from "@/LF2/ditto/image/ImageInfo";
import type { IUINodeRenderer } from "@/LF2/ditto/render/IUINodeRenderer";
import { TextInput } from "@/LF2/ui/component/TextInput";
import { INinePatch, IUIImgInfo } from "@/LF2/ui/IUIImgInfo.dat";
import type { UINode } from "@/LF2/ui/UINode";
import { get_alpha_from_color } from "@/LF2/ui/utils/get_alpha_from_color";
import { ceil, is_num, is_str, round } from "@/LF2/utils";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import * as T from "../_t";
import { empty_texture } from "./empty_texture";
import { get_geometry, get_ninepatch_geometry, get_plane_geometry } from "./GeometryKeeper";
import styles from "./ui_node_style.module.scss";
import { white_texture } from "./white_texture";
import type { WorldRenderer } from "./WorldRenderer";
interface IUserData {
  w?: number;
  h?: number;
  t_x?: number,
  t_y?: number,
  t_z?: number,
  ui_img?: IUIImgInfo,
  img?: ImageInfo<T.Texture>,
  nine_patch?: INinePatch,
}
export class UINodeRenderer implements IUINodeRenderer {
  mesh: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;
  ui: UINode;

  protected _css_obj: CSS2DObject | undefined;
  protected _dom: HTMLDivElement | undefined;
  protected _ui_img?: IUIImgInfo;
  protected _geo = get_geometry(0, 0, 0, 0, 0);
  protected _rgba: [number, number, number, number] = [255, 255, 255, 1];
  protected _texture: T.Texture = empty_texture();
  protected img_idx_version: number | null = null;
  protected imgs_version: number | null = null;
  protected txt_idx_version: number | null = null;
  protected txts_version: number | null = null;
  protected size_version: number | null = null;
  protected color_version: number | null = null;
  protected center_version: number | null = null;
  protected scale_version: number | null = null;
  protected pos_version: number | null = null;
  protected _img: ImageInfo<T.Texture> | undefined;
  get is_size_dirty() { return this.size_version != this.ui.size.version }
  get is_center_dirty() { return this.center_version != this.ui.center.version }

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
    this.mesh.add(this._css_obj);
    return this._dom;
  }
  protected release_dom() {
    if (!this._css_obj) return;
    this.mesh.remove(this._css_obj);
    delete this._css_obj;
    delete this._dom;
  }
  protected hide_dom() {
    if (!this._css_obj) return;
    if (!this._css_obj.parent) return;
    this.mesh.remove(this._css_obj);
  }
  protected show_dom() {
    if (!this._css_obj) return;
    if (this._css_obj.parent) return;
    this.mesh.add(this._css_obj);
  }

  get world() { return this.ui.lf2.world }
  get lf2() { return this.ui.lf2 }
  get parent() { return this.ui.parent?.renderer || null }
  img_idx = -1
  constructor(ui: UINode) {
    this.ui = ui;
    this.mesh = new T.Mesh(
      this.next_geometry(),
      new T.MeshBasicMaterial({ transparent: true, opacity: 1 }),
    )
    this.mesh.userData.owner = ui;
  }
  del(child: UINodeRenderer) {
    this.mesh.remove(child.mesh)
  }
  add(child: UINodeRenderer) {
    this.mesh.add(child.mesh)
  }
  del_self() {
    this.mesh.removeFromParent();
  }
  on_resume(): void {
    const world_renderer = this.lf2.world.renderer as WorldRenderer;
    if (this.ui.root === this.ui) world_renderer.scene.inner.add(this.mesh);
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
      ele_input.onfocus = () => text_input.node.focused = true
      ele_input.onblur = () => text_input.node.focused = false
      this.dom.appendChild(ele_input)
    }
  }

  on_pause(): void {
    const text_input = this.ui.find_component(TextInput)
    const world_renderer = this.lf2.world.renderer as WorldRenderer;
    if (this.ui.root === this.ui) world_renderer.scene.inner.remove(this.mesh);
    if (text_input) this.release_dom()
  }
  on_show(): void { }
  on_hide(): void { }
  on_start() {
    this.update_center_and_size()
    const [x, y, z] = this.ui.pos.value;
    this.mesh.position.set(x, -y, z)
    this.mesh.visible = this.ui.visible;
    this.mesh.name = `layout(name= ${this.ui.name}, id=${this.ui.id})`
    this.apply();
    this.ui.parent?.renderer.add(this);
  }
  on_stop() {
    this.del_self()
    this.release_dom();
  }

  apply() {
    const { mesh: sp } = this;
    sp.geometry = this.next_geometry();
    const {
      _texture,
      _rgba: [_r, _g, _b],
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


  update_texture() {
    if (
      this.img_idx_version === this.ui.img_idx.version &&
      this.imgs_version === this.ui.imgs.version &&
      this.txt_idx_version === this.ui.txt_idx.version &&
      this.txts_version === this.ui.txts.version &&
      this.color_version === this.ui.color.version
    ) return;
    const img: ImageInfo | undefined =
      this.ui.imgs.value[this.ui.img_idx.value] ||
      this.ui.txts.value[this.ui.txt_idx.value];
    this._ui_img = this.ui.data.img[this.ui.img_idx.value];
    this._img = img;
    const color = this.ui.color.value;
    const texture: T.Texture = img ? img.pic?.texture : color ? white_texture() : empty_texture();
    const a = get_alpha_from_color(color) || 1
    const { r, g, b } = new T.Color(color);
    this._rgba = [ceil(r * 255), ceil(g * 255), ceil(b * 255), a];
    this._texture = texture;
  }


  get x(): number { return this.mesh.position.x }
  set x(v: number) { this.mesh.position.x = v; }
  get y(): number { return this.mesh.position.y }
  set y(v: number) { this.mesh.position.y = v; }
  get visible() {
    return this.mesh.visible
  }
  set visible(v: boolean) {
    this.mesh.visible = v
    if (v) this.show_dom(); else this.hide_dom()
  }
  protected _tran_x: number = 0;
  protected _tran_y: number = 0;
  protected _tran_z: number = 0;
  protected _w: number = 0;
  protected _h: number = 0;
  readonly user_data: IUserData = {}

  is_geo_changed(): boolean {
    const { _w, _h, _tran_x, _tran_y, _tran_z, _img } = this;
    const _nine_path = this._ui_img?.nine_patch
    const { w, h, t_x, t_y, t_z, nine_patch, img } = this.user_data;
    return _w != w || _h != h || t_x != _tran_x || t_y != _tran_y ||
      t_z != _tran_z || _nine_path != nine_patch || _img != img
  }
  protected next_geometry(): T.BufferGeometry {
    if (!this.is_geo_changed()) return this._geo;
    const { _w: w, _h: h, _tran_x, _tran_y, _tran_z, _ui_img: ui_img, _img: img } = this;
    const nine_patch = ui_img?.nine_patch;
    if (ui_img && nine_patch && img) {
      this._geo = get_ninepatch_geometry({
        ...nine_patch, w, h, tx: _tran_x, ty: _tran_y, tz: _tran_z, t_s: 1 / img.scale
      })
    } else {
      this._geo = get_plane_geometry({ w, h, tx: _tran_x, ty: _tran_y, tz: _tran_z });
    }
    this.user_data.img = img
    this.user_data.nine_patch = nine_patch
    this.user_data.w = w;
    this.user_data.h = h;
    this.user_data.t_x = _tran_x;
    this.user_data.t_y = _tran_y;
    this.user_data.t_z = _tran_z;
    this.user_data.nine_patch = nine_patch;
    return this._geo;
  }

  update_center_and_size() {
    if (!this.is_size_dirty && !this.is_center_dirty) return;
    const [w, h] = this.ui.size.value;
    const [x, y, z] = this.ui.center.value
    this._w = w;
    this._h = h;
    this._tran_x = round(w * (0.5 - x));
    this._tran_y = round(h * (y - 0.5));
    this._tran_z = round(z);
  }
  update_dom() {
    if (this._dom && this.is_size_dirty) {
      this._dom.style.width = `${this._w}px`
      this._dom.style.height = `${this._h}px`
    }
    if (this._css_obj && this.is_center_dirty)
      this._css_obj.center.set(this.ui.center.value[0], this.ui.center.value[1])
  }
  update_texture_attributes(dt: number) {
    const t = this.mesh.material.map;
    if (!t || !this._ui_img) return;
    const { offsetAnimX, offsetAnimY } = this._ui_img
    if (!offsetAnimX && !offsetAnimY && this.user_data.ui_img == this._ui_img)
      return
    const { wrapS, wrapT, repeatX, repeatY } = this._ui_img
    if (offsetAnimX !== void 0) t.offset.y += (dt / 1000) * offsetAnimX;
    if (offsetAnimY !== void 0) t.offset.x += (dt / 1000) * offsetAnimY;
    if (wrapS !== void 0) t.wrapS = (wrapS as any)
    if (wrapT !== void 0) t.wrapT = (wrapT as any)
    if (repeatX !== void 0) t.repeat.setX(repeatX)
    if (repeatY !== void 0) t.repeat.setY(repeatY)
    t.needsUpdate = true
  }

  render(dt: number) {
    this.update_center_and_size()
    this.update_dom();
    this.update_texture();
    if (this.ui.scale.version !== this.scale_version)
      this.mesh.scale.set(...this.ui.scale.value);
    this.update_texture_attributes(dt)

    const sp = this.mesh;
    if (this.ui.pos.version !== this.pos_version) {
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

    this.center_version = this.ui.center.version
    this.scale_version = this.ui.scale.version;
    this.pos_version = this.ui.pos.version;
    this.img_idx_version = this.ui.img_idx.version
    this.imgs_version = this.ui.imgs.version
    this.txt_idx_version = this.ui.txt_idx.version
    this.txts_version = this.ui.txts.version
    this.size_version = this.ui.size.version
    this.color_version = this.ui.color.version
  }
}
