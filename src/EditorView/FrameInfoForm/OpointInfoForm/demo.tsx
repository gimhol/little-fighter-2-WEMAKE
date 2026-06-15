import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { opoint_info_new, IOpointInfo } from "@/LF2";
import { useState } from "react";
import { OpointInfoForm } from "./index";

type Data = IOpointInfo;
const data_new = opoint_info_new;
const TITLE = `OpointInfoForm`;
const Form = OpointInfoForm;

export default function OpointInfoFormDemo() {
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
