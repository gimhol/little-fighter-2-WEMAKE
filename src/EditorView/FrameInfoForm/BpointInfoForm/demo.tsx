import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { bpoint_info_new, type IBpointInfo } from "@/LFW";
import { useState } from "react";
import { BpointInfoForm } from "./index";

type Data = IBpointInfo;
const data_new = bpoint_info_new;
const TITLE = `BpointInfoForm`;
const Form = BpointInfoForm;

export default function BpointInfoFormDemo() {
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
