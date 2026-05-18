import { Defines, floor, max, min, random_in } from "@/LF2";
import type { IWorldRenderer } from "@/LF2/ditto/render/IWorldRenderer";
import { type Entity } from "@/LF2/entity";
import type { LF2 } from "@/LF2/LF2";
import type { World } from "@/LF2/World";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { Camera, Object3D, OrthographicCamera, Scene, Vector3, WebGLRenderer } from "../_t";
import { BgRender } from "./BgRender";
import { EntityRenderer } from "./EntityRenderer";
import csses from "./styles.module.scss";

export class WorldRenderer implements IWorldRenderer {
  readonly lf2: LF2;
  readonly world: World;
  readonly bg_render: BgRender;
  readonly camera: Camera;
  readonly ui_container: Object3D;
  readonly ui_offset = new Vector3(0, 0, 0);
  readonly bg_container: Object3D;
  readonly bg_offset = new Vector3(0, 0, 0);
  readonly entity_renderers = new Set<EntityRenderer>();
  readonly world_node = new Object3D();
  readonly world_offset = new Vector3(0, 0, 0);
  readonly is_scene_node = true;
  protected _cameras = new Set<Camera>();
  protected _renderer?: WebGLRenderer;
  protected _css_renderer?: CSS2DRenderer;
  protected _canvas_ob = new MutationObserver(() => this.on_win_resize());
  protected scene: Scene = new Scene();
  protected renderer_w: number = 0;
  protected renderer_h: number = 0;
  indicators: number = 0;
  get cam_x() { return this.cam_p1.x }
  set cam_x(v) { this.cam_p1.x = max(0, v) }
  get cam_y() { return this.cam_p1.y }
  set cam_y(v) { this.cam_p1.y = v }

  private cam_p0 = new Vector3()
  private cam_p1 = new Vector3()

  set_renderer_size(w: number, h: number): this {
    this.renderer_w = w;
    this.renderer_h = h;
    this._renderer?.setSize(w, h, false);
    return this;
  }
  on_win_resize = () => {
    if (!this._css_renderer || !this._renderer) return;
    const styles = window.getComputedStyle(this._renderer.domElement)
    let w = parseInt(styles.width)
    let h = parseInt(styles.height)
    const scale = w / Defines.CLASSIC_SCREEN_WIDTH
    this._css_renderer.setSize(w / scale, h / scale)
    this._css_renderer.domElement.style.top = styles.top;
    this._css_renderer.domElement.style.left = styles.left;
    this._css_renderer.domElement.style.width = floor(w / scale) + 'px';
    this._css_renderer.domElement.style.height = floor(h / scale) + 'px';
    this._css_renderer.domElement.style.zIndex = '1';
    this._css_renderer.domElement.style.transform = `scale(${scale})`
    this._css_renderer.domElement.style.transformOrigin = `0px 0px`
  }
  constructor(world: World) {
    if (!world) debugger;
    if (!world.lf2) debugger;

    this.world = world;
    this.lf2 = world.lf2;
    const w = world.screen_w;
    const h = world.screen_h;

    this.bg_render = new BgRender(this);
    this.set_renderer_size(w * 4, h * 4);
    this.scene.add(this.world_node);

    this.ui_container = new Object3D();
    this.scene.add(this.ui_container);

    this.bg_container = new Object3D();
    this.scene.add(this.bg_container);
    {
      const camera = this.camera = new OrthographicCamera()
      camera.left = 0;
      camera.right = w;
      camera.top = h;
      camera.bottom = 0;
      camera.near = 0.1;
      camera.far = 2000;
      camera.position.set(0, 0, 100)
      this.cam_p1.copy(camera.position)
      this.cam_p0.copy(camera.position)
      camera.name = "default_orthographic_camera"
      this.add_camera(camera);
      camera.updateProjectionMatrix();
    }

    {
      // this.ui_offset.x = -Defines.MODERN_SCREEN_WIDTH / 2
      // this.ui_offset.y = -Defines.MODERN_SCREEN_HEIGHT / 2
      // this.world_offset.x = -Defines.MODERN_SCREEN_WIDTH / 2
      // this.world_offset.y = -Defines.MODERN_SCREEN_HEIGHT / 2

      // const camera = this.camera = new PerspectiveCamera()
      // camera.aspect = Defines.MODERN_SCREEN_WIDTH / Defines.MODERN_SCREEN_HEIGHT
      // camera.near = 0.1;
      // camera.far = 2000;
      // camera.position.set(0, 0, 482)
      // camera.name = "default_orthographic_camera"
      // this.scene.add_camera(camera);
      // camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', this.on_win_resize)
  }

  add_entity(entity: Entity): void {
    let renderer: EntityRenderer = entity.renderer;
    if (!renderer) renderer = entity.renderer = new EntityRenderer(entity)

    renderer.mount();
    this.entity_renderers.add(renderer)
  }
  del_entity(e: Entity): void {
    const renderer: EntityRenderer = e.renderer;
    if (!renderer) return;
    renderer.unmount();
    this.entity_renderers.delete(renderer);
  }
  private _t = 0;
  private _update_time = 0;
  render(dt: number): void {
    const tu = this.world.TU;
    this._t = min(this._t + dt, tu);

    const update_time = this.world.update_time
    if (this._update_time != update_time) {
      this._update_time = update_time;
      this._t = 0;
      this.cam_p0.copy(this.cam_p1)
      this.cam_p1.x = this.world.current_cam_x;
    }

    if (this.world.sync_render == 0) {
      const f = this._t / tu;
      this.camera.position.lerpVectors(this.cam_p0, this.cam_p1, f)
      const { x, y } = this.camera.position;
      this.ui_container.position.set(
        x + this.ui_offset.x,
        y + this.world.screen_h + this.ui_offset.y,
        this.ui_offset.z
      )
    } else {
      this.camera.position.copy(this.cam_p1)
      const { x, y } = this.camera.position;
      this.ui_container.position.set(
        x + this.ui_offset.x,
        y + this.world.screen_h + this.ui_offset.y,
        this.ui_offset.z
      )
    }



    const { indicator_flags, transform } = this.world;
    let { x, y, z, earthquake, earthquake_level, scale_x, scale_y, scale_z } = transform
    if (earthquake) x += random_in(-earthquake_level, earthquake_level)
    this.world_node.position.set(
      x + this.world_offset.x,
      y + this.world_offset.y,
      z + this.world_offset.z
    );
    this.world_node.scale.set(scale_x, scale_y, scale_z);
    if (indicator_flags != this.indicators)
      this.indicators = indicator_flags;
    this.bg_render.render(dt);
    for (const renderer of this.entity_renderers)
      renderer.render(dt)
    for (const ui_stack of this.lf2.ui_stacks)
      ui_stack.ui?.renderer.render(dt)

    const { scene } = this;
    if (!this._renderer) return;
    for (const camera of this._cameras) {
      this._renderer.render(scene, camera);
      this._css_renderer?.render(scene, camera);
    }
  }
  set_canvas(canvas: HTMLCanvasElement | null | undefined) {
    if (this._renderer) {
      if (canvas === this._renderer.domElement)
        return;
      this._renderer.clear();
      this._renderer.dispose();
    }
    this._renderer = void 0;
    if (canvas) {
      const { renderer_w, renderer_h } = this;
      this._canvas_ob.observe(canvas, { attributes: true, attributeFilter: ['style'] })
      this._renderer = new WebGLRenderer({ canvas, premultipliedAlpha: false });
      this._renderer.setSize(renderer_w, renderer_h, false);
      this._css_renderer = new CSS2DRenderer();
      this._css_renderer.domElement.className = csses.css_2d_renderer
      this.on_win_resize()
      canvas.parentElement?.appendChild(this._css_renderer.domElement);
    } else {
      this._canvas_ob.disconnect()
    }
  }
  add_camera(...cameras: Camera[]) {
    for (const camera of cameras) {
      if (this._cameras.has(camera)) continue;
      this._cameras.add(camera);
    }
  }
  dispose() {
    window.removeEventListener('resize', this.on_win_resize)
    if (this._css_renderer) this._css_renderer?.domElement.remove()
    this._canvas_ob.disconnect()
    this._renderer?.clear();
    this._renderer?.dispose();
    this._renderer = void 0;
    this.bg_render.release();
  }
}
