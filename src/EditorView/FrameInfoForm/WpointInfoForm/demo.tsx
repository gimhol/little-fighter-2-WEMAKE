import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { wpoint_info_new, type IWpointInfo } from "@/LFW";
import { useState } from "react";
import { WpointInfoForm } from "./index";

type Data = IWpointInfo;
const data_new = wpoint_info_new;
const TITLE = `WpointInfoForm`;
const Form = WpointInfoForm;

export default function WpointInfoFormDemo() {
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
