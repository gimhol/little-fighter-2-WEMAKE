import { useEffect, useState } from "react";
import { EntityInfoEditorView } from "./index";
import { entity_info_new, IEntityInfo } from "@/LF2";

export default function () {
  const [value, set_value] = useState<IEntityInfo>(() => entity_info_new())
  useEffect(() => {
    console.log(value)
  }, [value])
  return (
    <EntityInfoEditorView
      value={value}
      onChange={v => {
        console.log('on_changed: ', v)
        set_value(v)
      }}
      style={{ position: 'absolute', inset: 0 }} />
  )
}