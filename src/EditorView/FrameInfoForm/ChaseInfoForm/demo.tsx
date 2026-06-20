import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { chase_info_new, type IChaseInfo } from "@/LFW";
import { useState } from "react";
import { ChaseInfoForm } from "./index";

type Data = IChaseInfo;
const data_new = chase_info_new;
const TITLE = `ChaseInfoForm`;
const Form = ChaseInfoForm;

export default function ChaseInfoFormDemo() {
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
