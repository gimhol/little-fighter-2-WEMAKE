import { Base, type IIconProps } from './Base';

export function ArrowDown(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  )
}
const o = Object.assign(ArrowDown, Base)
ArrowDown.path = o.m(o.pad)
  .l(o.w / 2, o.h - o.pad, o.r, o.pad)
  .ok()

