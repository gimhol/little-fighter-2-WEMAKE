import type { BackgroundGroup } from "./BackgroundGroup";
import { any, fields, flt, int, str } from "../fields";

export interface IBgInfo {
  name: string;
  shadow: string;
  shadow_w: number;
  shadow_h: number;
  group: (BackgroundGroup | string)[]
  left: number;
  right: number;
  far: number;
  near: number;
  height: number;
  zoom_x?: number;
  zoom_y?: number;
  zoom_z?: number;

  /** @deprecated shadow_w shadow_h*/
  // shadowsize?: [number, number];
  /** @deprecated zoom_x zoom_y zoom_z*/
  // zoom?: [number, number, number];
}

export function bg_info_new(): IBgInfo {
  return {
    name: "",
    shadow: "",
    shadow_w: 0,
    shadow_h: 0,
    group: [],
    left: 0,
    right: 0,
    far: 0,
    near: 0,
    height: 0,
  };
}