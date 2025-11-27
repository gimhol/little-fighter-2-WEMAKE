import type { UINode } from "../UINode";
import type { ICrossInfo } from "../ICrossInfo";
import { UIComponent } from "./UIComponent";
import { CrossInfo } from "../CrossInfo";


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
    const { followed_rect, follower_rect } = this;
    if (
      !followed_rect.compare(followed.cross) &&
      !follower_rect.compare(followed.cross)
    ) return;
    followed_rect.set(followed.cross);
    follower_rect.set(follower.cross);

    const follower_pos = follower.pos.value;
    let _left: number | null = null;
    let _right: number | null = null;
    let _top: number | null = null;
    let _bottom: number | null = null;

    switch (this.left!) {
      case "left": _left = followed_rect.left; break;
      case "right": _left = followed_rect.right; break;
      case "mid": _left = followed_rect.mid_x; break;
    }
    switch (this.right!) {
      case "left": _right = followed_rect.left; break;
      case "right": _right = followed_rect.right; break;
      case "mid": _right = followed_rect.mid_x; break;
    }
    switch (this.top!) {
      case "top": _top = followed_rect.top; break;
      case "bottom": _top = followed_rect.bottom; break;
      case "mid": _top = followed_rect.mid_y; break;
    }
    switch (this.bottom!) {
      case "top": _bottom = followed_rect.top; break;
      case "bottom": _bottom = followed_rect.bottom; break;
      case "mid": _bottom = followed_rect.mid_y; break;
    }
    if (this.x_mid) {
      _left = followed_rect.mid_x + follower_rect.left;
      _right = null;
    }
    if (this.y_mid) {
      _top = followed_rect.mid_y + follower_rect.top;
      _bottom = null;
    }

    if (_left !== null && _right !== null) {
      // resize width
    } else if (_left !== null) {
      follower_pos[0] = _left - follower_rect.left + this.offset_l
    } else if (_right !== null) {
      follower_pos[0] = _right - follower_rect.right + this.offset_r
    }
    if (_top !== null && _bottom !== null) {
      // resize height
    } else if (_top !== null) {
      follower_pos[1] = _top - follower_rect.top + this.offset_t
    } else if (_bottom !== null) {
      follower_pos[1] = _bottom - follower_rect.bottom + this.offset_b
    }
    follower.pos.value = follower_pos;
  }
}
