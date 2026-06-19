import { Base, type IIconProps } from './Base';

export function ArrowLeft(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  )
}
const o = Object.assign(ArrowLeft, Base)
ArrowLeft.path =
  `M ${o.r} ${o.pad} ` +
  `L ${o.pad} ${o.h / 2} ` +
  `L ${o.r} ${o.h - o.pad} `

