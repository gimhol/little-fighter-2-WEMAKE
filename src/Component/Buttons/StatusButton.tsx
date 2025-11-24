import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, IButtonProps } from "./Button";
import { TShortcut } from "@fimagine/dom-hooks";

export interface IStatusButtonProps<V = any, I = any>
  extends Omit<IButtonProps, "children" | "value" | "onChange" | "defaultValue"> {
  value?: V;
  defaultValue?: V;
  items?: I[];
  parse?: (item: I) => [V, React.ReactNode]
  onChange?(v: V | undefined): void;
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
  show_shortcut?: boolean;
  _ref?: React.Ref<HTMLButtonElement>;
}
function default_parse<V = any, I = any>(i: I): [V, React.ReactNode] {
  return [i as any, '' + i]
}

export function StatusButton<V = any, I = any>(props: IStatusButtonProps<V, I>) {
  const { value: outter_val, onClick, onChange, parse = default_parse, defaultValue, items, ..._p } = props;
  const ref_value = useRef(outter_val);
  const ref_onChange = useRef(onChange);

  const [inner_val, _set_inner_val] = useState(defaultValue);
  ref_value.current = outter_val ?? inner_val;
  ref_onChange.current = onChange ?? _set_inner_val;

  const value = outter_val ?? inner_val;

  const _onClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onClick?.(e);
    const value = ref_value.current;
    const onChange = ref_onChange.current;
    if (!items) {
      onChange?.(value);
      return;
    }
    const next_index = (items.findIndex(item => parse(item)[0] === value) + 1) % items.length;
    const next_item = items[next_index];
    const [next_value] = parse(next_item)
    onChange?.(next_value);

  }, [onClick, items, parse]);

  const label = useMemo(() => {
    if (!items) return '' + value;
    for (const item of items) {
      const [v, label] = parse(item)
      if (v === value) return label;
    }
    return '' + value;
  }, [items, value, parse]);

  return (
    <Button {..._p} onClick={_onClick}>
      {label}
    </Button>
  );
}
