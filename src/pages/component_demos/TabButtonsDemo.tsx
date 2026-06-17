import { useState } from "react";
import { TabButtons } from "../../Component/TabButtons";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { Text } from "../../Component/Text";

const items = ['Tab A', 'Tab B', 'Tab C'] as const;

export default function TabButtonsDemo() {
  const [value, setValue] = useState<string>('Tab A');

  return (
    <Frame label='TabButtons'>
      <Space direction='column'>
        <TabButtons
          value={value}
          items={items as any}
          parse={(i: string) => [i, i]}
          onChange={(v) => setValue(v as string)}
        />
        <Text>Selected: {value}</Text>
      </Space>
    </Frame>
  );
}
