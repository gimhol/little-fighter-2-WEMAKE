import { Base, type IIconProps } from "./Base";

export function Search(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
      <circle {...o.circle} fill='none' stroke='currentColor' />
    </Base>
  )
}
const o = Object.assign(Search, Base)
Search.path = o.m(o.l, o.b).l(o.w * .38, o.h * .62).ok()
Search.circle = {
  cx: o.w * .6,
  cy: o.h * .4,
  r: "3.5",
}