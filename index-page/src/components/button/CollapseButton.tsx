import { type IIconButtonProps, IconButton } from "@/components/button/IconButton";
import { usePropState } from "../../utils/usePropState";
export interface ICollapseButtonProps extends IIconButtonProps {
  open?: boolean;
  whenChange?(v: boolean): void;
}
export function CollapseButton(props: ICollapseButtonProps) {
  const { open, whenChange, onClick, ..._p } = props;
  const [__open, __set_open] = usePropState(open, whenChange)
  return (
    <IconButton
      onClick={(e) => {
        onClick?.(e);
        __set_open(!__open);
      }}
      title="fold or unfold"
      style={{ transform: `rotateZ(${__open ? 180 : 90}deg)` }}
      letter='人'
      {..._p} />
  );
}
