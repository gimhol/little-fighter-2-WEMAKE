import React, { useMemo, useState } from "react";
import { type IStatusButtonProps, StatusButton } from "./StatusButton";

export interface IToggleButtonProps
  extends Omit<IStatusButtonProps<boolean>, "onChange" | "items"> {
  children?:
  | [React.ReactNode, React.ReactNode]
  | [React.ReactNode]
  | React.ReactNode;
  onChange?: (v: boolean) => void;
}
export function ToggleButton(props: IToggleButtonProps) {
  const { children, onChange, value, ..._p } = props;
  const [v, set_v] = useState(false)
  const _items = useMemo(() => {
    if (Array.isArray(children)) {
      const [a, b = a] = children;
      return [
        { value: false, label: a },
        { value: true, label: b },
      ];
    }
    return [
      { value: false, label: children },
      { value: true, label: children },
    ];
  }, [children]);

  return (
    <StatusButton
      {..._p}
      items={_items}
      value={value ?? v}
      parse={i => [i.value, i.label]}
      onChange={(v) => (onChange ?? set_v)(!!v)} />
  );
}
