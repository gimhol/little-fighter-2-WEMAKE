import type { BackgroundGroup } from "./BackgroundGroup";

export interface IBgInfo {
  name: string;
  shadow: string;
  shadowsize: [number, number];
  group: (BackgroundGroup | string)[]
  left: number;
  right: number;
  far: number;
  near: number;
  height: number;
  zoom?: [number, number, number];
}

export function bg_info_new(): IBgInfo {
  return {
    name: "",
    shadow: "",
    shadowsize: [0, 0],
    group: [],
    left: 0,
    right: 0,
    far: 0,
    near: 0,
    height: 0,
  };
}