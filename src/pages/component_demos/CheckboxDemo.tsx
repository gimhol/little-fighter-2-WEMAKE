import { useState } from "react";
import { Checkbox } from "../../Component/Checkbox";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";

export default function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <Frame label='Checkbox'>
      <Space direction='column'>
        <Titled label='Basic'>
          <Checkbox value={checked} onChange={setChecked}>
            {checked ? '已选中' : '未选中'}
          </Checkbox>
        </Titled>
        <Titled label='Disabled'>
          <Checkbox
            value={checked}
            disabled={disabled}
            onChange={setChecked}>
            <Checkbox value={disabled} onChange={setDisabled}>
              禁用
            </Checkbox>
          </Checkbox>
        </Titled>
      </Space>
    </Frame>
  );
}
