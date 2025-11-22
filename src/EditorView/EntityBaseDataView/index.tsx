
import { IFrameProps } from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { Defines, IEntityInfo } from "@/LF2/defines";
import { IEntityData } from "@/LF2/defines/IEntityData";
import { useEditor } from "../FrameEditorView/useEditor";
import { WorkspaceColumnView } from "../WorkspaceColumnView";

export interface IEntityBaseDataViewProps extends IFrameProps {
  value?: IEntityData;
  on_changed?(): void;
}

export function EntityBaseDataView(props: IEntityBaseDataViewProps) {
  const { value, on_changed, ..._p } = props;
  const data = value;
  const Editor = useEditor<IEntityInfo>(data?.base!);
  if (!data) return;
  return (
    <WorkspaceColumnView {..._p} title='基础信息'>
      <Space direction='column' stretchs style={{ width: '100%', padding: '20px 10px', boxSizing: 'border-box' }}>
        <Editor.ImageFile field="head" foo={data.base.head} />
        <Editor.ImageFile field="small" foo={data.base.small} />
        <Editor.Number field="ce" foo={data.base.ce} placeholder='1' />
        <Editor.Number field="fall_value" foo={data.base.fall_value} placeholder={'' + Defines.DEFAULT_FALL_VALUE_MAX} />
        <Editor.Number field="defend_value" foo={data.base.defend_value} placeholder={'' + Defines.DEFAULT_DEFEND_VALUE_MAX} />
        <Editor.Number field="resting" foo={data.base.resting} placeholder={'' + Defines.DEFAULT_RESTING_MAX} />
        <Editor.Number field="hp" foo={data.base.hp} placeholder={'' + Defines.DEFAULT_HP} />
        <Editor.Number field="mp" foo={data.base.mp} placeholder={'' + Defines.DEFAULT_MP} />
        <Editor.Number field="catch_time" foo={data.base.catch_time} placeholder={'' + Defines.DEFAULT_CATCH_TIME} />
        <Editor.Number field="jump_height" foo={data.base.jump_height} />
        <Editor.Number field="jump_distance" foo={data.base.jump_distance} />
        <Editor.Number field="jump_distancez" foo={data.base.jump_distancez} />
        <Editor.Number field="dash_height" foo={data.base.dash_height} />
        <Editor.Number field="dash_distance" foo={data.base.dash_distance} />
        <Editor.Number field="dash_distancez" foo={data.base.dash_distancez} />
        <Editor.Number field="rowing_height" foo={data.base.rowing_height} />
        <Editor.Number field="rowing_distance" foo={data.base.rowing_distance} />
      </Space>
    </WorkspaceColumnView>
  );
}
