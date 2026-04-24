import { IPropsMeta, IRect } from "@/LF2";
import { Easing } from "../../animation";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import { floor } from "../../utils/math/base";
import { UIComponent } from "./UIComponent";
export interface IImgLoopProps {
  w: number,
  h: number,
  col?: number,
  row?: number,
  count?: number,
  duration?: number,
}
export class ImgLoop extends UIComponent<IImgLoopProps> {
  static override readonly TAGS: string[] = ["ImgLoop"];
  static override readonly PROPS: IPropsMeta<IImgLoopProps> = {
    w: { type: Number, nullable: false },
    h: { type: Number, nullable: false },
    col: Number,
    row: Number,
    count: Number,
    duration: Number,
  }
  readonly anim = new Easing(0, 1).set_duration(1000)
    .set_ease_method(ease_linearity)
    .set_times(0)
    .set_fill_mode(1)
  readonly rects: IRect[] = [];
  override on_start(): void {
    const { duration = 1000, w, h, count = 1, col = 1, row = 1 } = this.props;
    this.anim.set(0, count).set_duration(duration);
    for (let i = 0; i < row && this.rects.length < count; ++i) {
      for (let j = 0; j < col && this.rects.length < count; ++j) {
        const x = w * j
        const y = h * i
        this.rects.push({ x, y, w, h })
      }
    }
  }
  stop(): void {
    this.anim.set_times(1).set_count(0)
  }
  start(): void {
    if (!this.enabled) this.enabled = true;
    this.anim.set_times(0).set_count(0)
  }
  override update(dt: number): void {
    if (this.rects.length <= 0) return;
    const { image } = this.node
    if (!image) {
      this.enabled = false;
      return;
    }
    this.anim.update(dt);
    const idx = floor(this.anim.value);
    const rect = this.rects[idx];
    if (!rect) {
      this.node.visible = false;
    } else {
      this.node.visible = true;
      this.node.image = image.clone();
      this.node.image.clip_x = rect.x
      this.node.image.clip_y = rect.y
      this.node.image.clip_w = rect.w
      this.node.image.clip_h = rect.h
    }

    if (this.anim.done) this.enabled = false;
  }
}