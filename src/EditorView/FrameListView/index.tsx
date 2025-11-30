import { Board, IFactory } from "@fimagine/writeboard";
import VirtualList from "rc-virtual-list";
import { useRef } from "react";
import { Input } from "../../Component/Input";
import { Space } from "../../Component/Space";
import { Text } from "../../Component/Text";
import { IFrameInfo } from "@/LF2/defines";
import { IEntityData } from "@/LF2/defines/IEntityData";
import { IZip } from "@/LF2/ditto";
import { EditorShapeEnum } from "../EditorShapeEnum";
import { FrameDrawer, FrameDrawerData } from "../FrameDrawer";
import { WorkspaceColumnView } from "../WorkspaceColumnView";
import styles from "./styles.module.scss";
export interface IFrameListViewProps {
  data?: IEntityData;
  zip?: IZip;
  ref_board: React.RefObject<Board | undefined>;
  factory: IFactory;
  on_pick_frame?(frame: IFrameInfo): void;
}


export function FrameListView(props: IFrameListViewProps) {
  const { data, zip, ref_board, factory, on_pick_frame } = props;
  const ref_next_frame = useRef<IFrameInfo>(undefined)
  if (!data) return void 0;
  const on_frame_change = (frame: IFrameInfo, data: IEntityData) => {
    const board = ref_board.current;
    if(!board) return;
    const shape_data = factory.newShapeData(EditorShapeEnum.LF2_FRAME) as FrameDrawerData;
    shape_data.frame = frame;
    shape_data.zip = zip;
    shape_data.data = data;
    shape_data.layer = board.layer().id;
    shape_data.id = 'frame';
    shape_data.z = factory.newZ(shape_data);
    const { w, h } = FrameDrawer.get_size(frame);
    Object.assign(shape_data, { w: w * 2, h: h * 2 })
    let shape = board.shapes().find(v => v.data.id === 'frame') as FrameDrawer | undefined;
    if (!shape) {
      shape = factory.newShape(shape_data) as FrameDrawer;
      board.add(shape);
    } else {
      let { x, y } = shape;
      if (shape.data.frame) {
        const a = FrameDrawer.get_bounding(shape.data.frame)
        const b = FrameDrawer.get_bounding(shape_data.frame)
        console.log(a.l, b.l)
        x += (b.l - a.l + shape.data.frame.centerx - shape_data.frame.centerx) * 2
        y += (b.t - a.t + shape.data.frame.centery - shape_data.frame.centery) * 2
      }
      shape_data.x = x
      shape_data.y = y
      shape.merge(shape_data)
      board.setSelects([shape])
    }
  }
  const frames: IFrameInfo[] = []
  for (const key in data.frames)
    frames.push(data.frames[key])
  const header = <WorkspaceColumnView.TitleAndAdd title="帧列表" />

  const on_key_down = (e: React.KeyboardEvent, frame: IFrameInfo) => {
    e.stopPropagation();
    e.preventDefault();
    switch (e.key.toLowerCase()) {
      case 'enter': {
        on_pick_frame?.(frame)
        on_frame_change(frame, data)
        return;
      }
    }
    const ele = (e.target as HTMLElement);
    const scroll_view = (ele.parentElement as HTMLElement | null)
    if (!scroll_view) return;
    const ele_collection = scroll_view.children;
    const next_ele = ((ele.nextElementSibling ?? ele_collection.item(0)) as HTMLElement | null)
    const prev_ele = ((ele.previousElementSibling ?? ele_collection.item(ele_collection.length - 1)) as HTMLElement | null)
    const pt = parseInt(getComputedStyle(scroll_view).paddingTop)
    switch (e.key.toLowerCase()) {
      case 'arrowdown':
      case 'pagedown': {
        if (!next_ele) break;
        scroll_view.scrollTo(0, next_ele.offsetTop - pt)
        next_ele.focus()
        const idx = (frames.indexOf(frame) + 1) % frames.length
        ref_next_frame.current = frames[idx]
        break;
      }
      case 'arrowup':
      case 'pageup': {
        if (!prev_ele) break;
        scroll_view.scrollTo(0, prev_ele.offsetTop - pt)
        prev_ele.focus()
        const idx = (frames.indexOf(frame) + frames.length - 1) % frames.length
        ref_next_frame.current = frames[idx]
        break;
      }
    }
  }
  const on_key_up = (e: React.KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'arrowdown':
      case 'pagedown':
      case 'arrowup':
      case 'pageup': {
        const next_frame = ref_next_frame.current;
        if (next_frame) {
          on_pick_frame?.(next_frame)
          on_frame_change(next_frame, data)
          ref_next_frame.current = void 0;
        }
        break;
      }
    }
  }
  return (
    <Space.Broken>
      <WorkspaceColumnView header={header}>
        <VirtualList
          data={frames}
          className={styles.frame_list_view}
          itemKey={i => i.id}>
          {(frame) => {
            return (
              <div
                tabIndex={-1}
                className={styles.frame_list_item_view}
                onClick={() => {
                  on_pick_frame?.(frame)
                  on_frame_change(frame, data)
                }}
                onKeyUp={on_key_up}
                onKeyDown={e => on_key_down(e, frame)}>
                <Text>{frame.id}</Text>
                <Input
                  variants="no_border"
                  defaultValue={frame.name}
                  onChange={v => frame.name = v}
                  style={{ flex: 1 }}
                  clearable />
              </div>
            )
          }}
        </VirtualList>
      </WorkspaceColumnView>
    </Space.Broken>
  )
}