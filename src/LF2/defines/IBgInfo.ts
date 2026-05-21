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
