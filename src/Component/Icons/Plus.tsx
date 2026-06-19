import { Base, type IIconProps } from "./Base";

export function Plus(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.paths[0]} />
      <Base.Path d={o.paths[1]} />
    </Base>
  );
}
const o = Object.assign(Plus, Base)
Plus.paths = [
  o.m(o.w / 2, o.pad, o.w / 2, o.h - o.pad).ok(),
  o.m(o.pad, o.h / 2, o.r, o.h / 2).ok()
]