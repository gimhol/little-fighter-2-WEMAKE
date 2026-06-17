import { useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import { Flex } from "../../Component/Flex";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";

export default function FlexDemo() {
  const [direction, setDirection] = useState<'row' | 'column'>('row');
  const [gap, setGap] = useState(8);

  return (
    <Frame label='Flex'>
      <Space direction='column'>
        <Titled label={`direction: ${direction}`}>
          <Space>
            <Button onClick={() => setDirection(direction === 'row' ? 'column' : 'row')}>
              切换方向
            </Button>
            <Button onClick={() => setGap(gap === 8 ? 16 : 8)}>
              gap: {gap}
            </Button>
          </Space>
        </Titled>
        <Flex direction={direction} gap={gap} style={{ background: '#333', padding: 8, borderRadius: 4 }}>
          <Button>Item 1</Button>
          <Button>Item 2</Button>
          <Button>Item 3</Button>
        </Flex>
        <Titled label='align + justify'>
          <Flex align='center' justify='space-between' style={{ background: '#333', padding: 8, borderRadius: 4, height: 60 }}>
            <Button>Left</Button>
            <Button>Center</Button>
            <Button>Right</Button>
          </Flex>
        </Titled>
      </Space>
    </Frame>
  );
}
