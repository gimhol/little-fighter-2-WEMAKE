import { Base, type IIconProps } from "./Base";

export function CircleCross(props: IIconProps) {
  return (
    <Base {...props}>
      <defs>
        <mask id="clear_mask">
          <circle
            cx={o.w / 2}
            cy={o.h / 2}
            r={o.w / 2}
            fill="#fff" />
          <Base.Path d={o.paths[0]} stroke='#000' />
          <Base.Path d={o.paths[1]} stroke='#000' />
        </mask>
      </defs>
      <circle
        cx={o.w / 2}
        cy={o.h / 2}
        r={o.w / 2}
        fill="currentColor"
        mask="url(#clear_mask)" />
    </Base>
  );
}
const o = Object.assign(CircleCross, Base);
CircleCross.paths = [
  o
    .m(o.w * 0.3, o.h * 0.3)
    .l(o.w * 0.7, o.h * 0.7)
    .ok(),
  o
    .m(o.w * 0.7, o.h * 0.3)
    .l(o.w * 0.3, o.h * 0.7)
    .ok(),
];
