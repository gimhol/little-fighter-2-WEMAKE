import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
import { Button } from "../../Component/Buttons/Button";
import { Input } from "../../Component/Input";

export default function TitledDemo() {
  return (
    <Frame label='Titled'>
      <Space direction='column'>
        <Titled label='Standard Label'>
          <Button>Content</Button>
        </Titled>
        <Titled float_label='Floating Label'>
          <Input placeholder='Input with float label' />
        </Titled>
        <Titled label='Vertical'>
          <Space direction='column'>
            <Button>A</Button>
            <Button>B</Button>
          </Space>
        </Titled>
      </Space>
    </Frame>
  );
}
