import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { Text, type UiSize } from "../../Component/Text";

const sizes: UiSize[] = ['ss', 's', 'm', 'l'];

export default function TextDemo() {
  return (
    <Frame label='Text'>
      <Space direction='column'>
        {sizes.map(size => (
          <Text key={size} size={size}>
            Text size={size} — 敏捷的棕色狐狸跳过懒狗
          </Text>
        ))}
        <Text.Strong size='l'>
          Strong Text — 加粗文字
        </Text.Strong>
      </Space>
    </Frame>
  );
}
