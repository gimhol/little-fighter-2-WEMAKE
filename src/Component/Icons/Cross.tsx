import { Base, type IIconProps } from "./Base";
export function Cross(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.paths[0]} />
      <Base.Path d={o.paths[1]} />
    </Base>
  );
}
const o = Object.assign(Cross, Base)
const f = 1.3
Cross.paths = [
  o.m(f * o.pad, f * o.pad, o.w - f * o.pad, o.h - f * o.pad).ok(),
  o.m(f * o.pad, o.h - f * o.pad, o.w - f * o.pad, f * o.pad).ok()
]