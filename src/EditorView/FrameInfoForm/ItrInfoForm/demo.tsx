import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { itr_info_new, type IItrInfo } from "@/LF2";
import { useState } from "react";
import { ItrInfoForm } from "./index";

type Data = IItrInfo;
const data_new = itr_info_new;
const TITLE = `ItrInfoForm`;
const Form = ItrInfoForm;

export default function ItrInfoFormDemo() {
  const [value, set_value] = useState<Data>(data_new);
  const on_changed = (v: Data) => {
    console.log(`[${TITLE}] on_changed: `, v);
    set_value(v);
  };
  return (
    <WorkspaceColumnView title={TITLE} style={{ position: 'absolute', inset: 0 }}>
      <Form value={value} onChange={on_changed} style={{ width: '100%', padding: '20px 10px', boxSizing: 'border-box' }} />
    </WorkspaceColumnView>
  );
}
