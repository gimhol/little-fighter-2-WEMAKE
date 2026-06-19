import { useRef, useState } from "react";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { TextArea, type ITextAreaRef } from "../../Component/TextArea";
import Titled from "../../Component/Titled";

export default function TextAreaDemo() {
  const [value, setValue] = useState<string>();
  const ref = useRef<ITextAreaRef>(null);

  return (
    <Frame label='TextArea'>
      <Space direction='column'>
        <TextArea
          ref={ref}
          placeholder='请输入多行文本...'
          style={{ width: 300, minHeight: 80 }}
          onChange={setValue}
        />
        <Titled label='Value'>
          <pre style={{ color: '#aaa', fontSize: 12, maxWidth: 300, overflow: 'auto' }}>
            {value || '(empty)'}
          </pre>
        </Titled>
      </Space>
    </Frame>
  );
}
