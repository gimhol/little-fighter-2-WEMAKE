import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { bdy_info_new, IBdyInfo } from "@/LF2";
import { useState } from "react";
import { BdyInfoForm } from "./index";

type Data = IBdyInfo;
const data_new = bdy_info_new;
const TITLE = `BdyInfoForm`;
const Form = BdyInfoForm;

export default function BdyInfoFormDemo() {
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
