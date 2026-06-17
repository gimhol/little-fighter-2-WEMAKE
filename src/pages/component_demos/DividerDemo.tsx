import Frame from "../../Component/Frame";
import { Divider } from "../../Component/Divider";
import { Flex } from "../../Component/Flex";
import { Space } from "../../Component/Space";
import { Text } from "../../Component/Text";

export default function DividerDemo() {
  return (
    <Frame label='Divider'>
      <Space direction='column'>
        <Text>上方内容</Text>
        <Divider />
        <Text>下方内容</Text>
        <Flex align='center' gap={8}>
          <Text>左侧</Text>
          <Divider style={{ flex: 1 }} />
          <Text>右侧</Text>
        </Flex>
      </Space>
    </Frame>
  );
}
