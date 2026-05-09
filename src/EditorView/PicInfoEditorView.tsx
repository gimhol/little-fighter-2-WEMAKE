import Frame, { IFrameProps } from "../Component/Frame";
import { Cross } from "../Component/Icons/Cross";
import { Space } from "../Component/Space";
import { IEntityData } from "../LF2/defines/IEntityData";
import { ILegacyPictureInfo } from "../LF2/defines/ILegacyPictureInfo";
import { traversal } from "../LF2/utils/container_help/traversal";
import { useEditor } from "./FrameEditorView/useEditor";
export interface IFileEditorViewProps extends IFrameProps {
  data: IEntityData;
  pic_info: ILegacyPictureInfo;
  on_changed?(): void;
}
export function PicInfoEditorView(props: IFileEditorViewProps) {
  const { data, pic_info, on_changed, ..._p } = props;
  const on_input_id_blur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const prev_id = pic_info.id;
    const next_id = e.target.value.trim();
    if (prev_id === next_id || !next_id) {
      e.target.value = prev_id;
      return;
    }
    const { files = {} } = data.base
    if (next_id in files) {
      alert('ID不可重复')
      e.target.value = pic_info.id;
      return;
    }
    delete files[prev_id];
    pic_info.id = next_id;
    files[next_id] = pic_info;
    traversal(data.frames, (_, { pic }) => {
      if (!pic) return;
      if (pic.tex.trim() === prev_id) {
        pic.tex = next_id;
      }
    })
    traversal(data.base.files, (_, v) => {
      v.variants?.forEach((v, idx, arr) => {
        if (v.trim() === prev_id) {
          arr[idx] = next_id;
        }
      })
    })
    on_changed?.();
  }
  const on_click_remove = () => {
    const { files } = data.base;
    for (const k in data.frames) {
      if (data.frames[k].pic?.tex.trim() === pic_info.id) {
        alert(`已经被帧:${k}引用，不能删除!`)
        return;
      }
    }
    if (files) delete files[pic_info.id]
    on_changed?.();
  }
  const { String, Strings, ImageFile: EditorImg } = useEditor(pic_info)
  return (
    <Frame {..._p} label='图片索引信息'>
      <Cross style={{ position: 'absolute', top: 0, right: 0 }} onClick={on_click_remove} hoverable />
      <Space vertical stretchs>
        <String field='id' title='图片索引id' onBlur={on_input_id_blur} />
        <EditorImg field='path' title='图片路径' clearable={false} />
        <Strings field="variants" placeholder="图片索引id" title="变体" />
      </Space>
    </Frame>
  );
}
