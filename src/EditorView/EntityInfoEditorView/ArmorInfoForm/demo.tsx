import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { armor_Info_new, IArmorInfo } from "@/LF2";
import { useState } from "react";
import { ArmorInfoForm } from "./index";

type Data = IArmorInfo;
const data_new = armor_Info_new;
const TITLE = `ArmorInfoForm`;
const Form = ArmorInfoForm;

export default function ArmorInfoFormDemo() {
  const [value, set_value] = useState<Data>(data_new)
  const on_changed = (v: Data) => {
    console.log(`[${TITLE}] on_changed: `, v)
    set_value(v)
  }
  return (
    <WorkspaceColumnView title={TITLE} style={{ position: 'absolute', inset: 0 }}>
      <Form value={value} onChange={on_changed} style={{ width: '100%', padding: '20px 10px', boxSizing: 'border-box' }}/>
    </WorkspaceColumnView>

  )
}