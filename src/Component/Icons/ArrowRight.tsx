import { Base, type IIconProps } from './Base';

export function ArrowRight(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  )
}
const o = Object.assign(ArrowRight, Base)
ArrowRight.path =
  `M ${o.pad} ${o.pad} ` +
  `L ${o.r} ${o.h / 2} ` +
  `L ${o.pad} ${o.h - o.pad} `

