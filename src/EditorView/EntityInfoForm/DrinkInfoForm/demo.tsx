import { WorkspaceColumnView } from "@/EditorView/WorkspaceColumnView";
import { drink_info_new, type IDrinkInfo } from "@/LF2";
import { useState } from "react";
import { DrinkInfoForm } from "./index";

type Data = IDrinkInfo;
const data_new = drink_info_new;
const TITLE = `DrinkInfoForm`;
const Form = DrinkInfoForm;

export default function DrinkInfoFormDemo() {
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