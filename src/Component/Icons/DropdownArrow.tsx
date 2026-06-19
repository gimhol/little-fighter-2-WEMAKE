import { Base, type IIconProps } from "./Base";
export function DropdownArrow(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  );
}
const o = Object.assign(DropdownArrow, Base)
DropdownArrow.tt = o.h / 2 - 0.5 * o.pad
DropdownArrow.bb = o.h / 2 + 1.5 * o.pad
DropdownArrow.path = o
  .m(o.l, o.tt)
  .l(o.w / 2, o.bb)
  .l(o.r, o.tt).ok()