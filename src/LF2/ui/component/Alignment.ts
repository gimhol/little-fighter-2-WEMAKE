import { CrossInfo } from "../CrossInfo";
import type { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";


export class Alignment extends UIComponent {
  static override TAG: string = 'Alignment';
  followed: UINode | null = null;
  follower: UINode | null = null;
  left: "left" | "right" | 'mid' | null = null;
  right: "left" | "right" | 'mid' | null = null;
  top: "top" | "bottom" | 'mid' | null = null;
  bottom: "top" | "bottom" | 'mid' | null = null;

  x_mid: boolean = false;
  y_mid: boolean = false;

  offset_l: number = 0;
  offset_r: number = 0;
  offset_t: number = 0;
  offset_b: number = 0;

  followed_rect = new CrossInfo()
  follower_rect = new CrossInfo()
  followed_pos: [number, number, number] = [0, 0, 0];

  override on_start(): void {
    this.followed = this.find_node(this.props.str("followed") ?? "parent")
    this.follower = this.find_node(this.props.str("follower"))
    this.left = this.props.str("left")
    this.right = this.props.str("right")
    this.top = this.props.str("top")
    this.bottom = this.props.str("bottom")
    this.x_mid = !!this.props.bool("x_mid")
    this.y_mid = !!this.props.bool("y_mid")
    this.x_mid = !!this.props.bool("x_mid")
    this.y_mid = !!this.props.bool("y_mid")
    this.offset_l = this.props.num("offset_l") || 0
    this.offset_r = this.props.num("offset_r") || 0
    this.offset_t = this.props.num("offset_t") || 0
    this.offset_b = this.props.num("offset_b") || 0


    if (this.followed === this.follower) {
      throw new Error('[Alignment] "responser" cant not be same as "listening"')
    }
  }
  override update(dt: number): void {
    const { followed, follower } = this
    if (followed === follower || !followed || !follower) return;
    const { followed_rect: c1, follower_rect: c2 } = this;
    const g = followed.global_pos;
    if (
      g[0] != this.followed_pos[0] &&
      g[1] != this.followed_pos[1] &&
      g[2] != this.followed_pos[2] &&
      !c1.compare(followed.cross) &&
      !c2.compare(follower.cross)
    ) return;
    this.followed_pos[0] = g[0]
    this.followed_pos[1] = g[1]
    this.followed_pos[2] = g[2]
    c1.set(followed.cross);
    c2.set(follower.cross);

    const follower_pos = follower.global_pos;
    const follower_siz = follower.size.value;
    let l: number | null = null;
    let r: number | null = null;
    let t: number | null = null;
    let b: number | null = null;

    switch (this.left!) {
      case "left": l = g[0] + c1.left; break;
      case "right": l = g[0] + c1.right; break;
      case "mid": l = g[0] + c1.mid_x; break;
    }
    switch (this.right!) {
      case "left": r = g[0] + c1.left; break;
      case "right": r = g[0] + c1.right; break;
      case "mid": r = g[0] + c1.mid_x; break;
    }
    switch (this.top!) {
      case "top": t = g[1] + c1.top; break;
      case "bottom": t = g[1] + c1.bottom; break;
      case "mid": t = g[1] + c1.mid_y; break;
    }
    switch (this.bottom!) {
      case "top": b = g[1] + c1.top; break;
      case "bottom": b = g[1] + c1.bottom; break;
      case "mid": b = g[1] + c1.mid_y; break;
    }
    if (this.x_mid) {
      l = g[0] + c1.mid_x + c2.left;
      r = null;
    }
    if (this.y_mid) {
      t = g[1] + c1.mid_y + c2.top;
      b = null;
    }

    if (l !== null && r !== null) {
      const w = (r - l) - this.offset_l + this.offset_r
      follower_siz[0] = w;
      follower_pos[0] = l - c2.left + this.offset_l
      // resize width
    } else if (l !== null) {
      follower_pos[0] = l - c2.left + this.offset_l
    } else if (r !== null) {
      follower_pos[0] = r - c2.right + this.offset_r
    }
    if (t !== null && b !== null) {
      const h = (b - t) - this.offset_t + this.offset_b
      follower_pos[1] = t - c2.top + this.offset_t
      follower_siz[1] = h
      // resize height
    } else if (t !== null) {
      follower_pos[1] = t - c2.top + this.offset_t
    } else if (b !== null) {
      follower_pos[1] = b - c2.bottom + this.offset_b
    }
    follower.global_pos = follower_pos;
    follower.size.value = follower_siz;
  }
}
