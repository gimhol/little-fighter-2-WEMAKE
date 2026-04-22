import { LF2 } from "../LF2";
import { Callbacks, Expression, StateDelegate } from "../base";
import { IStyle, IValGetter, IVector3 } from "../defines";
import { Ditto as D, ImageInfo, IUINodeRenderer, TextInfo } from "../ditto";
import { IDebugging, make_debugging } from "../entity";
import { filter, is_bool, is_num, is_str, round, Times } from "../utils";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { ICrossInfo } from "./ICrossInfo";
import { IUICallback } from "./IUICallback";
import { IUIKeyEvent } from "./IUIKeyEvent";
import { LF2PointerEvent } from "./LF2PointerEvent";
import { actor } from "./action";
import { UIComponent } from "./component";
import { parse_ui_value } from "./read_info_value";
export class UINode implements IDebugging {

  static readonly TAG: string = 'UINode';
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;

  readonly lf2: LF2;
  readonly id_ui_map: Map<string, UINode[]>;
  readonly name_ui_map: Map<string, UINode[]>;

  /**
   * 原始UI数据
   * 
   * 对UINode的一些属性进行修改，不会影响到原始UI数据。
   *
   * @type {Readonly<ICookedUIInfo>}
   * @memberof UINode
   */
  readonly data: Readonly<ICookedUIInfo>;

  protected _callbacks = new Callbacks<IUICallback>();
  protected _pointer_over: 0 | 1 = 0;
  protected _pointer_down: 0 | 1 = 0;
  protected _click_flag: 0 | 1 = 0;
  protected _update_times = new Times(0, Number.MAX_SAFE_INTEGER);
  protected _components_updating: boolean = false;
  protected _del_components: UIComponent[] = [];

  get callbacks() {
    return this._callbacks;
  }
  /**
   * 根节点
   *
   * @protected
   * @type {UINode}
   */
  protected _root: UINode;
  protected _focused_node?: UINode;
  protected _components = new Set<UIComponent>();
  protected _state: any = {};
  protected _visible = true;
  protected _disabled = false;
  protected _opacity = () => 1;

  readonly pos: IVector3 = new D.Vector3();
  readonly scale: IVector3 = new D.Vector3(1, 1, 1)
  readonly size: IVector3 = new D.Vector3();
  readonly center: IVector3 = new D.Vector3()

  readonly txts: StateDelegate<TextInfo[]> = new StateDelegate(() => this.data.txt_infos).comparer(StateDelegate.CompareArray);
  readonly imgs: StateDelegate<ImageInfo[]> = new StateDelegate(() => this.data.img_infos).comparer(StateDelegate.CompareArray);

  readonly img_idx: StateDelegate<number> = new StateDelegate(0);
  readonly txt_idx: StateDelegate<number> = new StateDelegate(0);
  readonly color: StateDelegate<string> = new StateDelegate(() => parse_ui_value(this.data, "string", this.data.color) ?? '');

  protected _parent?: UINode;
  protected _children: UINode[] = [];

  get cross(): ICrossInfo {
    const { x: w, y: h } = this.size
    const { x: a, y: b } = this.center
    const left = -a * w
    const top = -b * h
    const right = (1 - a) * w
    const bottom = (1 - b) * h
    return {
      left,
      top,
      right,
      bottom,
      mid_x: (left + right) / 2,
      mid_y: (top + bottom) / 2
    }
  }
  get rect() {
    const c = this.cross
    const { x, y } = this.pos
    return {
      left: x + c.left,
      top: y + c.top,
      right: x + c.right,
      bottom: y + c.bottom
    }
  }
  get geo() {
    const c = this.cross
    const { x, y } = this.global_pos
    return {
      pos: { x, y },
      left: x + c.left,
      top: y + c.top,
      right: x + c.right,
      bottom: y + c.bottom
    }
  }
  get focused(): boolean {
    return this._root._focused_node === this;
  }
  set focused(v: boolean) {
    if (v === (this.focused_node === this)) return;
    if (v) this.focused_node = this;
    else if (this.focused_node === this) this.focused_node = void 0;
  }
  get focused_node(): UINode | undefined {
    return this._root._focused_node;
  }
  set focused_node(val: UINode | undefined) {
    const old = this._root._focused_node;
    if (old === val) return;
    if (val?.disabled || !val?.visible) val = void 0;
    this._root._focused_node = val;
    if (old) {
      old.on_blur();
      old._callbacks.emit("on_foucs_changed")(old);
    }
    if (val) {
      val.on_foucs();
      val._callbacks.emit("on_foucs_changed")(val);
    }
    this._root._callbacks.emit("on_foucs_item_changed")(val, old);
  }

  get id(): string | undefined { return this.data.id }
  get name(): string | undefined { return this.data.name }
  get root(): UINode { return this._root; }

  get depth(): number {
    return this.parent ? this.parent.depth + 1 : 0;
  }

  get state() {
    return this._state;
  }

  get self_visible() {
    return this._visible
  }
  /**
   * 当前节点是否可见
   * 
   * @description 
   *    要注意，当任意一个祖先节点visible为false时，
   *    即使设置当前节点为visible为true，visible属性仍将返回false
   *
   * @type {boolean}
   */
  get visible(): boolean {
    if (!this.parent) return this.self_visible
    return this.parent.visible && this.self_visible;
  }

  set visible(v: boolean) {
    this.set_visible(v);
  }
  private _background: string | null = null;
  private _backgroundAlpha: number | null = null;
  private _foreground: string | null = null;
  private _foregroundAlpha: number | null = null;
  get background(): string { return this._background ?? this.data.background ?? '#000000' }
  set background(v: string | null) { this._background = v; }
  get foreground(): string { return this._foreground ?? this.data.foreground ?? '#000000' }
  set foreground(v: string | null) { this._foreground = v; }
  get backgroundAlpha(): number { return this._backgroundAlpha ?? this.data.backgroundAlpha ?? 0 }
  set backgroundAlpha(v: number | null) { this._backgroundAlpha = v; }
  get foregroundAlpha(): number { return this._foregroundAlpha ?? this.data.foregroundAlpha ?? 0 }
  set foregroundAlpha(v: number | null) { this._foregroundAlpha = v; }
  set_visible(v: boolean): this {
    const prev = this.visible;
    this._visible = v;
    if (prev !== this.visible) this.invoke_all_visible()
    if (!v && !this.focused_node?.visible) this.focused_node = void 0
    return this;
  }

  get disabled(): boolean {
    if (!this.parent) return this._disabled;
    return this.parent.disabled || this._disabled;
  }
  set disabled(v: boolean) {
    this.set_disabled(v);
  }
  set_disabled(v: boolean): this {
    this._disabled = v;
    if (v && this.focused_node?.disabled) this.focused_node = void 0
    return this;
  }
  get self_disabled() { return this._disabled }

  get global_opacity(): number {
    if (!this.parent) return this._opacity()
    return this._opacity() * this.parent._opacity();
  }
  get opacity(): number { return this._opacity(); }
  set opacity(v: number) { this.set_opacity(v); }
  set_opacity(v: number): this { this._opacity = () => v; return this; }

  get parent(): UINode | undefined { return this._parent; }
  get children(): Readonly<UINode[]> { return this._children; }

  get w(): number { return this.size.x; }
  set w(v: number) { this.set_w(v); }
  get h(): number { return this.size.y; }
  set h(v: number) { this.set_h(v); }
  set_w(v: number): this { return this.resize(v, this.h); }
  set_h(v: number): this { return this.resize(this.w, v); }
  resize(x: number, y: number, z: number = this.size.z): this {
    this.size.x = x;
    this.size.y = y;
    this.size.z = z;
    return this;
  }

  get x(): number { return this.pos.x; }
  set x(v: number) { this.set_x(v); }
  get y(): number { return this.pos.y; }
  set y(v: number) { this.set_y(v); }
  get z(): number { return this.pos.z; }
  set z(v: number) { this.set_z(v); }
  set_x(v: number): this { return this.move_to(v); }
  set_y(v: number): this { return this.move_to(void 0, v); }
  set_z(v: number): this { return this.move_to(void 0, void 0, v); }
  move_to(x: number = this.x, y: number = this.y, z: number = this.z): this {
    this.pos.x = x;
    this.pos.y = y;
    this.pos.z = z;
    return this;
  }

  get cx(): number { return this.center.x; }
  set cx(v: number) { this.set_cx(v); }
  get cy(): number { return this.center.y; }
  set cy(v: number) { this.set_cy(v); }
  get cz(): number { return this.center.z; }
  set cz(v: number) { this.set_cz(v); }
  set_cx(v: number): this { return this.set_center(v); }
  set_cy(v: number): this { return this.set_center(void 0, v); }
  set_cz(v: number): this { return this.set_center(void 0, void 0, v); }
  set_center(x: number = this.cx, y: number = this.cy, z: number = this.cz): this {
    this.center.x = x;
    this.center.y = y;
    this.center.z = z;
    return this;
  }

  get sx(): number { return this.scale.x; }
  set sx(v: number) { this.set_sx(v); }
  get sy(): number { return this.scale.y; }
  set sy(v: number) { this.set_sy(v); }
  get sz(): number { return this.scale.z; }
  set sz(v: number) { this.set_sz(v); }
  set_sx(v: number): this { return this.set_scale(v); }
  set_sy(v: number): this { return this.set_scale(void 0, v); }
  set_sz(v: number): this { return this.set_scale(void 0, void 0, v); }
  set_scale(x: number = this.sx, y: number = this.sy, z: number = this.sz): this {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
    return this;
  }

  get components(): ReadonlySet<UIComponent> {
    return this._components;
  }
  get style(): IStyle {
    return this.txts.value[0].style || {}
  }
  /** 光标是否在本节点上 */
  get pointer_over() { return this._pointer_over }
  /** 光标是否在本节点中按下 */
  get pointer_down() { return this._pointer_down }
  get click_flag() { return this._click_flag }
  get update_times() { return this._update_times.value }
  renderer: IUINodeRenderer;

  constructor(lf2: LF2, data: ICookedUIInfo, parent?: UINode) {
    this.lf2 = lf2;
    this.data = Object.freeze(data);
    this._parent = parent;
    this._root = parent?.root ?? this;
    this.id_ui_map = new Map();
    this.name_ui_map = new Map();

    this.renderer = new D.UINodeRenderer(this);
    make_debugging(this)
  }
  get global_pos(): IVector3 {
    const ret = this.pos.clone()
    if (!this.parent) return ret;
    ret.add(this.parent.global_pos)
    return ret;
  }
  set global_pos(v: IVector3) {
    if (!this.parent) { this.move_to(v.x, v.y, v.z); return; }
    const { x, y, z } = this.parent.global_pos
    this.move_to(v.x - x, v.y - y, v.z - z);
  }
  move_to_global(x: number, y: number, z: number): this {
    if (!this.parent) { this.move_to(x, y, z); return this; }
    const g = this.parent.global_pos
    this.move_to(x - g.x, y - g.y, z - g.z);
    return this;
  }
  hit(x: number, y: number): boolean {
    const { x: cx, y: cy } = this.center;
    const { x: px, y: py } = this.pos;
    const { x: dw, y: dh } = this.size;
    const l = px - round(cx * dw);
    const t = py - round(cy * dh);
    const [w, h] = this.data.size;
    return l <= x && t <= y && l + w >= x && t + h >= y;
  }
  on_pointer_down(e: LF2PointerEvent) {
    this._pointer_down = 1;
    this._click_flag = 1;
    for (const c of this.components)
      c.on_pointer_down?.(e);
    this.callbacks.emit('on_pointer_down')(e, this);
  }
  on_pointer_move(e: LF2PointerEvent) {
    for (const c of this.components)
      c.on_pointer_move?.(e);
    this.callbacks.emit('on_pointer_move')(e, this);
  }

  on_pointer_up(e: LF2PointerEvent) {
    this._pointer_down = 0
    for (const c of this.components)
      c.on_pointer_up?.(e);
    this.callbacks.emit('on_pointer_up')(e, this);
  }

  on_pointer_cancel(e: LF2PointerEvent) {
    this._pointer_down = 0
    for (const c of this.components)
      c.on_pointer_cancel?.(e);
    this.callbacks.emit('on_pointer_cancel')(e, this);
  }

  on_pointer_leave() {
    this._pointer_over = 0;
    this._click_flag = 0;
    for (const c of this.components)
      c.on_pointer_leave?.();
    this.callbacks.emit('on_pointer_leave')(this);
  }

  on_pointer_enter() {
    this._pointer_over = 1
    for (const c of this.components)
      c.on_pointer_enter?.();
    this.callbacks.emit('on_pointer_enter')(this);
  }

  on_start() {
    this._state = {};
    for (const c of this._components) {
      c.stopped = false;
      c.on_start?.();
    }
    for (const i of this.children) i.on_start();
    const { start } = this.data.actions || {};
    if (start) actor.act(this, start);
    this.renderer.on_start?.();
  }

  on_stop(): void {
    for (const c of this.components) {
      c.stopped = true;
      c.on_stop?.();
    }
    for (const l of this.children) l.on_stop();
    const { stop } = this.data.actions || {};
    if (stop) actor.act(this, stop);
    this.renderer.on_stop?.();
  }

  on_resume() {
    if (!this.parent) {
      this.focused_node = this._state.focused_node;
      if (this._visible) this.invoke_all_visible();
    }
    for (const c of this._components) {
      c.paused = false;
      c.on_resume?.();
    }
    for (const i of this.children) i.on_resume();
    const { resume } = this.data.actions || {};
    if (resume) actor.act(this, resume);
    this.renderer.on_resume?.();
  }

  on_pause() {
    if (!this.parent) {
      this._state.focused_node = this.focused_node;
      this.focused_node = void 0;
      this.invoke_all_on_hide();
    }
    if (this.root === this) this.renderer.del_self();
    const { pause } = this.data.actions || {};
    if (pause) actor.act(this, pause);
    for (const c of this._components) {
      c.paused = true;
      c.on_pause?.();
    }
    for (const item of this.children) item.on_pause();
    this.renderer.on_pause?.();
  }

  on_show() {
    for (const c of this.components) c.on_show?.();
    this._callbacks.emit("on_show")(this);
    if (this.data.auto_focus && !this.disabled && !this.focused_node) {
      this.focused_node = this;
    }
    this.renderer.on_show?.();
  }

  on_hide() {
    if (this.focused_node === this) this.focused_node = void 0;
    for (const c of this.components) c.on_hide?.();
    this._callbacks.emit("on_hide")(this);
    this.renderer.on_hide?.();
  }

  next_img(r: boolean = false) {
    const idx = this.img_idx.value;
    const len = this.data.img.length;
    this.img_idx.value = (r ? (idx + len - 1) : (idx + 1)) % len
  }
  next_txt(r: boolean = false) {
    const idx = this.txt_idx.value;
    const len = this.data.txt.length;
    this.txt_idx.value = (r ? (idx + len - 1) : (idx + 1)) % len
  }
  readonly cook = UINode.create.bind(UINode)

  static create(lf2: LF2, info: ICookedUIInfo, parent?: UINode): UINode {
    const ret = new UINode(lf2, info, parent);
    const get_val = lf2.ui_val_getter;
    ret._read_data(get_val);
    ret._cook_img_idx(get_val);

    const { component } = ret.data;
    if (component)
      for (const c of lf2.factory.create_components(ret, component))
        ret._components.add(c);

    if (info.items) {
      for (const item_info of info.items) {
        let count = (is_num(item_info.count) && item_info.count > 0) ? item_info.count : 1
        while (count) {
          const child = UINode.create(lf2, item_info, ret);
          ret.add_child(child)
          --count;
        }
      }
    }
    for (const component of ret._components)
      component.on_add?.();
    return ret;
  }

  add_child(node: UINode): this {
    this._children.push(node);
    if (node.id) {
      const set = this.id_ui_map.get(node.id) || [];
      set.push(node)
      this.id_ui_map.set(node.id, set);
    }
    if (node.name) {
      const set = this.name_ui_map.get(node.name) || [];
      set.push(node)
      this.name_ui_map.set(node.name, set);
    }
    return this;
  }

  add_children(...node: UINode[]): this {
    node.forEach(l => this.add_child(l))
    return this;
  }
  add_components(...components: UIComponent[]) {
    for (const component of components) {
      if (this._components.has(component))
        continue;
      this._components.add(component)
      component.on_add?.()
      this._callbacks.emit('on_component_add')(component, this)
    }
  }
  del_components(...components: UIComponent[]) {
    if (this._components_updating) {
      this._del_components.push(...components)
      return;
    }
    for (const component of components) {
      if (!this._components.has(component))
        continue;
      this._components.delete(component)
      component.on_del?.()
      this._callbacks.emit('on_component_del')(component, this)
    }
  }
  private _read_data(get_val: IValGetter<UINode>) {
    const { visible = true, opacity, disabled = false } = this.data;
    if (is_num(opacity)) {
      this._opacity = () => opacity;
    } else if (is_str(opacity)) {
      this._opacity = () => Number(get_val(this, opacity, "==")) || 0;
    }
    this._disabled = disabled
    this._visible = visible
    this.center.set(...this.data.center);
    this.pos.set(...this.data.pos);
    this.size.set(...this.data.size);
    this.scale.set(...this.data.scale);
  }

  private _cook_img_idx(get_val: IValGetter<UINode>) {
    const imgs = this.imgs.value;
    if (!imgs?.length) return;
    const { which } = this.data;
    if (is_str(which)) {
      this.img_idx.default_value = () => {
        const num = get_val(this, which, "==")
        return num % imgs.length || 0;
      };
      return
    }
    if (is_num(which)) {
      this.img_idx.default_value = () => (which % imgs.length || 0)
      return
    }
  }

  on_click(e: LF2PointerEvent) {
    const { click } = this.data.actions ?? {};
    if (click) {
      actor.act(this, click);
      e.stop_propagation();
    }
    for (const c of this._components) {
      c.on_click?.(e);
      if (e.stopped === 2) break;
    }
    this.callbacks.emit('on_click')(e);
  }

  /** 
   * 当前节点从"不可见"变为"可见"时被调用 
   */
  protected invoke_all_on_show() {
    this.on_show();
    for (const child of this.children) {
      if (child._visible) child.invoke_all_on_show();
    }
  }

  /** 
   * 当前节点从"可见"变为"不可见"时被调用 
   */
  protected invoke_all_on_hide() {
    this.on_hide();
    for (const child of this.children) {
      if (child._visible) child.invoke_all_on_hide();
    }
  }

  protected invoke_all_visible() {
    if (this._visible) {
      this.invoke_all_on_show();
    } else {
      this.invoke_all_on_hide();
    }
  }

  update(dt: number) {
    this._update_times.add();

    this._components_updating = true;
    for (const c of this._components) if (c.enabled) c.update?.(dt);
    this._components_updating = false;
    if (this._del_components.length) {
      this.del_components(...this._del_components);
      this._del_components.length = 0;
    }

    for (const i of this.children) if (!i.disabled) i.update(dt);
  }

  on_key_down(e: IUIKeyEvent) {
    if (e.stopped) return;
    for (const c of this._components) {
      c.on_key_down?.(e);
      if (e.stopped === 2) return;
    }
    for (const i of this.children) {
      i.on_key_down(e);
      if (e.stopped === 2) return;
    }
    if (this.focused && "a" === e.game_key) {
      const { click } = this.data.actions ?? {};
      if (click) {
        actor.act(this, click);
        e.stop_immediate_propagation();
      }
    }
  }

  on_key_up(e: IUIKeyEvent) {
    if (e.stopped) return;
    for (const i of this.children) {
      i.on_key_up(e);
      if (e.stopped === 2) return;
    }
    for (const c of this._components) {
      c.on_key_up?.(e);
      if (e.stopped === 2) return;
    }
  }

  /**
   * 根据子节点ID查找子节点
   *
   * @see {IUIInfo.id}
   * @param {string} id 子节点ID
   * @return {(UINode | undefined)} 
   * @memberof UINode
   */
  find_child(id: string): UINode | undefined {
    return this.id_ui_map.get(id)?.[0];
  }
  search_child(id: string): UINode | undefined {
    let ret = this.find_child(id);
    if (ret) return ret;
    for (const child of this.children) {
      ret = child.search_child(id)
      if (ret) return ret;
    }
  }

  /**
   * 根据子节点名查找子节点
   *
   * @see {IUIInfo.name}
   * @param {string} name 子节点名
   * @return {(UINode | undefined)} 
   * @memberof UINode
   */
  find_child_by_name(name: string): UINode | undefined {
    return this.name_ui_map.get(name)?.[0];
  }

  find_parent<T>(
    id: string | ((node: UINode) => any),
    handler?: (parent: UINode, path: UINode[]) => T
  ): UINode | undefined {
    let { parent } = this;
    const path: UINode[] = []
    while (parent) {
      path.push(parent);
      if (
        (typeof id === 'string' && parent.id === id) ||
        (typeof id === 'function' && id(parent))
      ) {
        if (handler) handler(parent, path);
        return parent;
      }
      parent = parent.parent;
    }
    return void 0;
  }

  get_value(name: string, lookup: boolean = true): any {
    const { values } = this.data;
    if (values && name in values) return values[name];
    if (lookup && this.parent) return this.parent.get_value(name, lookup);
    return void 0;
  }

  traversal_components(fn: (c: UIComponent, depth: number) => any, depth = 0): boolean {
    for (const c of this.components) if (fn(c, depth)) return true;
    for (const c of this.children) if (c.traversal_components(fn, ++depth)) return true;
    return false;
  }

  /**
   * 查找当前layout符合条件的的component
   *
   * @template T
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @return {(InstanceType<T> | undefined)}
   * @memberof UINode
   */
  find_component<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> | string = () => 1
  ): InstanceType<T> | undefined {
    for (const v of this._components) {
      if (!(v instanceof type))
        continue;
      if (!condition)
        continue
      if (condition === v.id)
        return v as InstanceType<T>;
      if (typeof condition === 'function' && condition(v as any))
        return v as InstanceType<T>;
    }
    return void 0;
  }

  /**
   * 查找当前layout符合条件的的component数组
   *
   * @template T
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @return {InstanceType<T>[]}
   * @memberof UINode
   */
  find_components<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> | string = () => 1
  ): InstanceType<T>[] {
    const ret = filter(
      this.components,
      (v) => {
        if (!(v instanceof type)) return 0;
        if (is_str(condition)) return condition === v.id;
        return condition(v as any);
      },
    ) as InstanceType<T>[];
    return ret;
  }

  /**
   * 查找当前layout以及子layout符合条件的component
   *
   * @template T 
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @return {(InstanceType<T> | undefined)}
   * @memberof UINode
   */
  search_component<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> | string = () => 1
  ): InstanceType<T> | undefined {
    const ret = this.find_component(type, condition);
    if (ret) return ret;
    for (const i of this._children) {
      const ret = i.search_component(type, condition);
      if (ret) return ret;
    }
  }

  /**
   * 查找当前layout以及子layout符合条件的component数组
   *
   * @template T
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @return {InstanceType<T>[]}
   * @memberof UINode
   */
  search_components<T extends TCls<UIComponent>>(
    type: T, condition: TCond<T> | string = () => 1
  ): InstanceType<T>[] {
    const ret = this.find_components(type, condition);
    for (const i of this._children)
      ret.push(...i.search_components(type, condition));
    return ret;
  }

  /**
   * 向上查找组件，当前节点不存在对应组件
   *
   * @template T
   * @param {T} type
   * @param {TCond<T>} [condition=() => 1]
   * @return {(InstanceType<T> | undefined)}
   * @memberof UINode
   */
  lookup_component<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> = () => 1
  ): InstanceType<T> | undefined {
    const ret = this.find_component(type, condition);
    if (ret) return ret;
    return this.parent?.lookup_component(type, condition);
  }

  on_foucs(): void {
    for (const c of this._components) c.on_foucs?.();
    this.renderer.on_foucs?.()
  }
  on_blur(): void {
    for (const c of this._components) c.on_blur?.();
    this.renderer.on_blur?.()
  }
  blur(): void {
    this.focused = false;
  }
}
type TCls<R = any> = abstract new (...args: any) => R;
type TCond<T extends TCls,> = (c: InstanceType<T>) => unknown;

