import { Base, type IIconProps } from './Base';

export function ArrowUp(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  )
}
const o = Object.assign(ArrowUp, Base)
ArrowUp.path =
  `M ${o.l} ${o.b} ` +
  `L ${o.w / 2} ${o.t} ` +
  `L ${o.r} ${o.b} `
