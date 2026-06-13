import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { entity_info_new, IEntityInfo } from "@/LF2";
import { useState } from "react";
import { EntityInfoEditorView as EntityInfoForm } from "./index";


type Data = IEntityInfo;
const data_new = entity_info_new;
const TITLE = `EntityInfoForm`;
const Form = EntityInfoForm;

export default function ArmorInfoFormDemo() {
  const [value, set_value] = useState<Data>(data_new)
  const on_changed = (v: Data) => {
    console.log(`[${TITLE}] on_changed: `, v)
    set_value(v)
  }
  return (
    <WorkspaceColumnView title={TITLE} style={{ position: 'absolute', inset: 0 }}>
      <Form value={value} onChange={on_changed} style={{ width: '100%', padding: '20px 10px', boxSizing: 'border-box' }} />
    </WorkspaceColumnView>

  )
}