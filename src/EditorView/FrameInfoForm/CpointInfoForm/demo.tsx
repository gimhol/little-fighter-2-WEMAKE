import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { cpoint_info_new, type ICpointInfo } from "@/LFW";
import { useState } from "react";
import { CpointInfoForm } from "./index";

type Data = ICpointInfo;
const data_new = cpoint_info_new;
const TITLE = `CpointInfoForm`;
const Form = CpointInfoForm;

export default function CpointInfoFormDemo() {
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
