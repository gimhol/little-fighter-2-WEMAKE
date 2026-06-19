import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { frame_info_new, type IFrameInfo } from "@/LF2";
import { useState } from "react";
import { FrameInfoForm } from "./index";

type Data = IFrameInfo;
const data_new = frame_info_new;
const TITLE = `FrameInfoForm`;
const Form = FrameInfoForm;

export default function FrameInfoFormDemo() {
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
