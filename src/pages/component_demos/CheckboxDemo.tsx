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
        <Checkbox prefix='Example' value={checked} onChange={setChecked} >
          {checked ? '已选中' : '未选中'}
        </Checkbox>
        <Checkbox prefix='Disabled' value={disabled} onChange={setDisabled} disabled>
          禁用
        </Checkbox>
      </Space>
    </Frame>
  );
}
