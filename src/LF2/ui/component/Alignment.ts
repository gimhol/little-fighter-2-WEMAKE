import type { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";

interface IFolloweds {
  l?: UINode | null
  r?: UINode | null
  t?: UINode | null
  b?: UINode | null
}
interface IAligns {
  l?: "left" | "right" | "mid" | null;
  r?: "left" | "right" | null;
  t?: "top" | "bottom" | "mid" | null;
  b?: "top" | "bottom" | null;
}
interface IOffsets {
  l: number;
  r: number;
  t: number;
  b: number;
}
class Offsets implements IOffsets {
  l: number = 0;
  r: number = 0;
  t: number = 0;
  b: number = 0;
}
export class Alignment extends UIComponent {
  static override TAG: string = 'Alignment';
  follower: UINode | null = null;

  readonly followed: IFolloweds = {};
  readonly align: IAligns = {}
  readonly offset: Offsets = new Offsets
  override on_start(): void {
    this.followed.l = this.find_node(this.props.raw.followed?.l ?? "parent")
    this.followed.r = this.find_node(this.props.raw.followed?.r ?? "parent")
    this.followed.t = this.find_node(this.props.raw.followed?.t ?? "parent")
    this.followed.b = this.find_node(this.props.raw.followed?.b ?? "parent")
    this.follower = this.find_node(this.props.str("follower"))
    this.align.l = this.props.str("left")
    this.align.r = this.props.str("right")
    this.align.t = this.props.str("top")
    this.align.b = this.props.str("bottom")
    this.offset.l = Number(this.props.raw.offset?.l ?? this.props.raw.offset_l) || 0
    this.offset.r = Number(this.props.raw.offset?.r ?? this.props.raw.offset_r) || 0
    this.offset.t = Number(this.props.raw.offset?.t ?? this.props.raw.offset_t) || 0
    this.offset.b = Number(this.props.raw.offset?.b ?? this.props.raw.offset_b) || 0
  }
  override update(dt: number): void {
    const { followed, follower, offset } = this
    if (!follower) return;
    let _l: number | null = null;
    let _r: number | null = null;
    let _t: number | null = null;
    let _b: number | null = null;

    const [cx, cy] = follower.center.value;
    let [x, y, z] = follower.global_pos;
    let [w, h] = follower.size.value;

    if (this.align.r && followed.r && followed.r !== follower) {
      const [x] = followed.r.global_pos;
      const c = followed.r.cross;
      switch (this.align.r) {
        case "left": _r = x + c.left; break;
        case "right": _r = x + c.right; break;
      }
    }

    if (this.align.l && followed.l && followed.l !== follower) {
      const [x] = followed.l.global_pos;
      const c = followed.l.cross;
      switch (this.align.l) {
        case "left": _l = x + c.left; break;
        case "right": _l = x + c.right; break;
        case "mid":
          _l = x + c.mid_x - 0.5 * w;
          _r = null;
          break;
      }
    }

    if (this.align.b && followed.b && followed.b !== follower) {
      const [, y] = followed.b.global_pos;
      const c = followed.b.cross;
      switch (this.align.b) {
        case "top": _b = y + c.top; break;
        case "bottom": _b = y + c.bottom; break;
      }
    }
    if (this.align.t && followed.t && followed.t !== follower) {
      const [, y] = followed.t.global_pos;
      const c = followed.t.cross;
      switch (this.align.t) {
        case "top": _t = y + c.top; break;
        case "bottom": _t = y + c.bottom; break;
        case "mid":
          _t = y + c.mid_y - 0.5 * h;
          _b = null;
          break;
      }
    }
    if (_l !== null && _r !== null) {
      w = (_r - _l) - offset.l + offset.r
    }
    if (_l !== null) {
      x = _l + cx * w + offset.l
    } else if (_r !== null) {
      x = _r - (1 - cx) * w + offset.r
    }
    if (_t !== null && _b !== null) {
      h = (_b - _t) - offset.t + offset.b
    }
    if (_t !== null) {
      y = _t + cy * h + offset.t
    } else if (_b !== null) {
      y = _b - (1 - cy) * h + offset.b
    }
    follower.global_pos = [x, y, z];
    follower.size.value = [w, h];
  }
}
