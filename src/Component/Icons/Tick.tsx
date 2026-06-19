import { Base, type IIconProps } from "./Base";

export function Tick(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} strokeWidth={1.5}/>
    </Base>
  );
}
const o = Object.assign(Tick, Base)
Tick.path = o
  .m(o.l, 6.5)
  .l(5, o.b - o.pad * .3)
  .l(o.r, o.t + o.pad / 2)
  .ok()