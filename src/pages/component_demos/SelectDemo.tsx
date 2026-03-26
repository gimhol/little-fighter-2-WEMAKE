import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Select } from "../../Component/Select";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
const items: string[] = []
for (let i = 0; i < 100; ++i) {
  items.push('option ' + i);
}
export default function SelectDemo() {
  return (
    <Frame label='Select'>
      <Space>
        <Select
          options={items}
          parse={v => [v, v]}
          placeholder="dropdown"
          clearable />
      </Space>
      <Combine style={{ overflow: 'visible' }}>
        <Titled >
          <Select
            options={items}
            parse={v => [v, v]}
            placeholder="dropdown"
            clearable />
        </Titled>
        <Titled >
          <Select
            options={items}
            parse={v => [v, v]}
            placeholder="dropdown"
            clearable />
        </Titled>
      </Combine>
    </Frame>
  );
}
