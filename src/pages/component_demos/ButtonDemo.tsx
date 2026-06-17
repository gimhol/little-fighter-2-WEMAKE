import { Button } from "../../Component/Buttons/Button";
import { StatusButton } from "../../Component/Buttons/StatusButton";
import { ToggleButton } from "../../Component/Buttons/ToggleButton";
import { ToggleImgButton } from "../../Component/Buttons/ToggleImgButton";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";


export default function ButtonDemo() {
  return (
    <Frame label='Button'>
      <Space direction='column'>
        <Titled label='Button'>
          <Space>
            <Button>按钮</Button>
            <Button disabled>禁用</Button>
            <Button actived>激活</Button>
          </Space>
        </Titled>
        <Titled label='ToggleButton'>
          <Space>
            <ToggleButton>
              <>切换1</>
              <>切换2</>
            </ToggleButton>
          </Space>
        </Titled>
        <Titled label='StatusButton'>
          <StatusButton items={['状态1', '状态2', '状态3']} defaultValue="状态1" />
        </Titled>
        <Titled label='ToggleImgButton'>
          <ToggleImgButton src={['', '']} alt={['ON', 'OFF']}>
            ToggleImg
          </ToggleImgButton>
        </Titled>
      </Space>
    </Frame>
  );
}
