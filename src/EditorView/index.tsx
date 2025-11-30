import { Board, FactoryEnum, Gaia, ToolEnum } from "@fimagine/writeboard";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DomAdapter } from "splittings-dom/dist/es/splittings-dom";
import "splittings-dom/dist/es/splittings-dom.css";
import { Slot, Workspaces } from "splittings/dist/es/splittings";
import { Button } from "../Component/Buttons/Button";
import { Checkbox } from "../Component/Checkbox";
import Combine from "../Component/Combine";
import Frame from "../Component/Frame";
import Select from "../Component/Select";
import Show from "../Component/Show";
import { Space } from "../Component/Space";
import { TabButtons } from "../Component/TabButtons";
import Titled from "../Component/Titled";
import { ITreeNode, ITreeNodeGetIcon, TreeView } from "../Component/TreeView";
import { IBgData, IFrameInfo } from "../LF2/defines";
import { EntityEnum } from "../LF2/defines/EntityEnum";
import { IEntityData } from "../LF2/defines/IEntityData";
import { ILegacyPictureInfo } from "../LF2/defines/ILegacyPictureInfo";
import { Ditto, IZip } from "../LF2/ditto";
import { ILf2Callback } from "../LF2/ILf2Callback";
import { LF2 } from "../LF2/LF2";
import { traversal } from "../LF2/utils/container_help/traversal";
import { is_num } from "../LF2/utils/type_check";
import { open_file } from "../Utils/open_file";
import { shared_ctx } from './Context';
import { EditorShapeEnum } from "./EditorShapeEnum";
import { EntityBaseDataView } from "./EntityBaseDataView";
import { EntityDataEditorView } from "./EntityDataEditorView";
import { FrameDrawer, FrameDrawerData } from "./FrameDrawer";
import { FrameEditor } from "./FrameEditorView";
import { ItrPrefabView } from "./FrameEditorView/ItrPrefabView";
import { FrameListView } from "./FrameListView";
import { PicInfoEditorView } from "./PicInfoEditorView";
import styles from "./styles.module.scss";
import { WorkspaceColumnView } from "./WorkspaceColumnView";


enum EntityEditing {
  base = '基础信息',
  frame_index = '特定帧',
  frames = '帧列表',
  pic = '图片',
  itr_pre = 'itr预设',
  bdy_pre = 'bdy预设',
}
Gaia.registerShape(
  EditorShapeEnum.LF2_FRAME,
  () => new FrameDrawerData(),
  (d) => new FrameDrawer(d),
  { desc: 'lf2 frame drawer' }
)
const factory = Gaia.factory(FactoryEnum.Default)();

export interface IEditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  open?: boolean;
  lf2?: LF2;
}
type TTreeNode = ITreeNode<IEntityData | IBgData | null>

const dat_type_emoji_map: { [x in string]?: React.ReactNode } = {
  [EntityEnum.Ball]: '🥏',
  [EntityEnum.Weapon]: '🗡️',
  [EntityEnum.Fighter]: '🏃‍➡️',
  [EntityEnum.Entity]: '🌀',
  'background': '⛰️'
}
const get_icon: ITreeNodeGetIcon<IEntityData | IBgData | null> = ({ node, depth }) => {
  if (depth === 0) return '📦';
  if (!node.data) return void 0;
  const type = node.data.type;
  return dat_type_emoji_map[type]
}

export default function EditorView(props: IEditorViewProps) {
  const ref_board = useRef<Board>(undefined);
  const [board_wrapper, set_board_wrapper] = useState<HTMLDivElement>()
  const { onClose, loading, open, lf2, ..._p } = props;
  const [zip_name, set_zip_name] = useState('');
  const [zips, set_zips] = useState<IZip[]>();
  const [zip, set_zip] = useState<IZip>();

  useEffect(() => {
    if (!lf2) return;
    const cb: ILf2Callback = {
      on_zips_changed: (zips) => set_zips(zips)
    }
    lf2.callbacks.add(cb);
    return () => lf2.callbacks.del(cb);

  }, [lf2])

  const [opens, set_opens] = useState<string[]>()
  const [tree, set_tree] = useState<TTreeNode>();
  const ref_editing_node = useRef<TTreeNode>(undefined)
  const ref_editing_data = useRef<IEntityData>(undefined)
  const [editing_node, set_editing_node] = useState<TTreeNode>();
  const [editing_data, set_editing_data] = useState<IEntityData>();
  const [tab, set_tab] = useState<EntityEditing | undefined>(EntityEditing.base);
  ref_editing_node.current = editing_node;
  ref_editing_data.current = editing_data;
  const [editing_frame, set_editing_frame] = useState<IFrameInfo>()

  const frame_list_view = useMemo(() => {
    return (
      <FrameListView
        factory={factory}
        data={editing_data}
        on_pick_frame={set_editing_frame}
        zip={zip}
        ref_board={ref_board}
      />
    )
  }, [editing_data, zip])

  const [state, set_state] = useState({
    mp3: false,
    flat: true,
    json: true,
    img: false,
    others: true
  })
  const filters_tree = useMemo(() => {
    const handle_tree_node = (src: TTreeNode): TTreeNode | undefined => {
      if (!src.children) {
        if (src.key.endsWith('.mp3')) {
          if (!state.mp3) return;
        } else if (src.key.endsWith('.json')) {
          if (!state.json) return;
        } else if (src.key.endsWith('.png')) {
          if (!state.img) return;
        } else if (src.key.endsWith('.webp')) {
          if (!state.img) return;
        } else if (!state.others) {
          return;
        }
      }
      const ret: TTreeNode = { ...src }
      if (!src.children) return ret;
      const children: TTreeNode[] = ret.children = []
      for (const child of src.children) {
        const o = handle_tree_node(child)
        if (o) children.push(o)
      }
      return ret;
    }

    const ret = tree ? handle_tree_node(tree) : void 0;
    if (ret && state.flat) {
      const children: TTreeNode[] = []
      const flat = (i: TTreeNode) => {
        if (!i.children) return;
        for (const child of i.children) {
          if (!child.children) children.push({ ...child, label: '' + child.title });
          else flat(child)
        }
      }
      flat(ret)
      ret.children = children;
    }
    return ret
  }, [tree, state])

  const on_click_read_zip = async () => {
    const [file] = await open_file({ accept: ".zip" });
    const zip = await Ditto.Zip.read_file(file);
    set_zip(zip);
    set_zip_name(file.name)
  };

  const load_zip = async (name: string, zip: IZip) => {
    const root: TTreeNode = { key: '', label: name, title: '' };
    for (const key in zip.files) {
      let node = root;
      const parts = key.split('/');
      const j = await zip.file(key)?.json().catch(v => void 0);
      for (let part_idx = 0; part_idx < parts.length; part_idx++) {
        const part = parts[part_idx];
        const children = node.children = node.children || [];
        const idx = children.findIndex(v => v.label === part);
        if (idx >= 0) node = children[idx];
        else children.push(node = {
          key: parts.slice(0, part_idx + 1).join('/'),
          label: part,
          title: parts.slice(0, part_idx + 1).join('/'),
          data: j
        });
      }
    }
    set_opens([root.key]);
    set_tree(root);
  }

  useEffect(() => {
    if (zip) load_zip(zip_name, zip)
  }, [zip_name, zip])


  useEffect(() => {
    const container = board_wrapper;
    if (!container || !open) return;
    const board = ref_board.current = factory.newWhiteBoard({ element: container });
    board.setToolType(ToolEnum.Selector);
    (window as any).board = board;
    const ob = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      board.width = width || 1;
      board.height = height || 1;
      board.markDirty({ x: 0, y: 0, w: width, h: height })
    })
    ob.observe(container)
    return () => {
      board.layer().destory();
      ob.disconnect();
    }
  }, [open, board_wrapper])

  const [change_flag, set_change_flag] = useState(0)
  // const files = editing_data?.base.files;

  const base_data_view = useMemo(() => {
    if (!editing_data) return;
    return (
      <Space.Broken>
        <EntityBaseDataView
          value={editing_data}
          on_changed={() => set_change_flag(change_flag + 1)}
          style={{ flex: 1, overflow: 'auto', flexFlow: 'column' }}
        />
      </Space.Broken>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing_data, change_flag])

  const pic_list_view = useMemo(() => {
    if (!editing_data) return;
    const views: React.ReactNode[] = []
    if (editing_data.base.files) traversal(editing_data.base.files, (k, v) => {
      views.push(
        <PicInfoEditorView
          pic_info={v as ILegacyPictureInfo}
          data={editing_data}
          key={'FileEditorView_' + k}
          on_changed={() => set_change_flag(change_flag + 1)}
        />
      )
    })

    const add = () => {
      let i = Object.keys(editing_data.base.files).length;
      while (('' + i) in editing_data.base.files) ++i;
      const pic_info: ILegacyPictureInfo = {
        row: 0,
        col: 0,
        id: '' + i,
        path: '',
        cell_w: 0,
        cell_h: 0,
      }
      editing_data.base.files['' + i] = pic_info
      set_change_flag(change_flag + 1);
    }
    const header = <WorkspaceColumnView.TitleAndAdd title="实体图片" on_add={add} />
    return (
      <Space.Broken>
        <WorkspaceColumnView header={header}>
          <Space.Item space vertical frame className={styles.file_editor_view}>
            {views}
          </Space.Item>
        </WorkspaceColumnView>
      </Space.Broken>
    )
  }, [editing_data, change_flag])

  const itr_prefabs = editing_data?.itr_prefabs;
  const itr_prefab_list_view = useMemo(() => {
    if (!editing_data) return void 0;
    const views: React.ReactNode[] = []
    if (itr_prefabs) traversal(itr_prefabs, (k, value) => {
      if (!value) return;
      const label = `itr_prefabs: ${k}`
      views.push(
        <ItrPrefabView
          label={label}
          value={value}
          data={editing_data}
          key={label}
          on_changed={() => set_change_flag(change_flag + 1)} />
      )
    })
    const add = () => {
      if (itr_prefabs) {
        let i = Object.keys(itr_prefabs).length;
        while (('' + i) in itr_prefabs) ++i;
        itr_prefabs['' + i] = { id: '' + i }
      } else {
        editing_data.itr_prefabs = {};
        editing_data.itr_prefabs['0'] = { id: '0' }
      }
      set_change_flag(change_flag + 1);
    }

    return (
      <Space.Broken>
        <WorkspaceColumnView header={
          <WorkspaceColumnView.TitleAndAdd title='ITR预设' on_add={add} />
        }>
          <div style={{ overflow: 'scroll', width: '100%', height: '100%' }}>
            <Space vertical className={styles.file_editor_view}>
              {views}
            </Space>
          </div>
        </WorkspaceColumnView>
      </Space.Broken>
    );
  }, [itr_prefabs, editing_data, change_flag])


  const ref_wprkspace_container = useRef<HTMLDivElement>(null);
  const ref_workspace = useRef<Workspaces<DomAdapter> | undefined>(void 0)
  const ref_adapter = useRef<DomAdapter | undefined>(void 0)
  const [cells, set_cells] = useState<Readonly<(HTMLElement | undefined)[]>>([])
  const views = useMemo(() => {
    const on_click_item = (node: TTreeNode) => {
      if (node.children) {
        set_opens((old = []) => {
          const ret = old.filter(v => v !== node.key)
          if (ret.length === old.length)
            ret.push(node.key)
          return ret.length ? ret : void 0;
        })
      } else if (node.data?.type) {
        switch (node.data?.type) {
          case EntityEnum.Entity:
          case EntityEnum.Fighter:
          case EntityEnum.Weapon:
          case EntityEnum.Ball:
            zip?.file(node.key)?.json().then(r => {
              const editing_node = ref_editing_node.current;
              const editing_data = ref_editing_data.current;
              if (zip && editing_node && editing_data) {
                zip.set(editing_node.key, JSON.stringify(editing_data))
              }
              set_editing_node(node)
              set_editing_data(r)
            });
            break;
          default: {
            zip?.file(node.key)?.text().then(() => {
              const editing_node = ref_editing_node.current;
              const editing_data = ref_editing_data.current;
              if (zip && editing_node && editing_data) {
                zip.set(editing_node.key, JSON.stringify(editing_data))
              }
              set_editing_node(node)
              set_editing_data(void 0)
            });
          }
        }
      } else if (node.key.endsWith('.txt') || node.key.endsWith('.json')) {
        zip?.file(node.key)?.text().then(r => {
          const editing_node = ref_editing_node.current;
          const editing_data = ref_editing_data.current;
          if (zip && editing_node && editing_data) {
            zip.set(editing_node.key, JSON.stringify(editing_data))
          }
          set_editing_node(node)
          set_editing_data(void 0)
        });
      }
    }
    return (
      cells.map(cell => {
        if (!cell) return null;
        switch (cell.id) {
          case 'res_tree_cell':
            return createPortal(
              <WorkspaceColumnView
                className={styles.cell_inner}
                header={
                  <WorkspaceColumnView.TitleAndAdd title={
                    <Space>
                      <Titled label="mp3"><Checkbox value={state.mp3} onChange={v => set_state(o => ({ ...o, mp3: v }))} /></Titled>
                      <Titled label="flat"><Checkbox value={state.flat} onChange={v => set_state(o => ({ ...o, flat: v }))} /></Titled>
                      <Titled label="json"><Checkbox value={state.json} onChange={v => set_state(o => ({ ...o, json: v }))} /></Titled>
                      <Titled label="img"><Checkbox value={state.img} onChange={v => set_state(o => ({ ...o, img: v }))} /></Titled>
                      <Titled label="others"><Checkbox value={state.others} onChange={v => set_state(o => ({ ...o, others: v }))} /></Titled>
                    </Space>
                  } />
                }>
                <Space.Item space vertical frame className={styles.file_editor_view}>
                  <TreeView
                    node={filters_tree}
                    opens={opens}
                    on_click_item={on_click_item}
                    get_icon={get_icon}
                  />
                </Space.Item>
              </WorkspaceColumnView>,
              cell,
              cell.id
            )
          case 'entity_info_cell':
            return createPortal(
              <div
                className={styles.cell_inner}
                style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <EntityDataEditorView
                  value={editing_data}
                  on_changed={() => set_change_flag(change_flag + 1)}
                  className={styles.entity_base_editor} />
                <Space.Item style={{ display: 'flex' }}>
                  <TabButtons
                    value={tab}
                    items={Object.values(EntityEditing)}
                    parse={v => [v, v]}
                    onChange={v => set_tab(v)}
                    style={{ flex: 1 }}
                    styles={{ button: { flex: 1 } }} />
                </Space.Item>
                <Space.Broken>
                  {tab === EntityEditing.base ? base_data_view : null}
                  {tab === EntityEditing.frames ? frame_list_view : null}
                  {tab === EntityEditing.pic ? pic_list_view : null}
                  {tab === EntityEditing.itr_pre ? itr_prefab_list_view : null}
                </Space.Broken>
              </div>,
              cell,
              cell.id
            )
          case 'frame_preview_cell':
            return createPortal(
              <Frame
                ref={(r) => set_board_wrapper(prev => r || prev)}
                className={styles.cell_inner}
                style={{ background: 'transparent' }} />,
              cell,
              cell.id
            )
          case 'frame_editor_cell':
            if (!editing_frame || !editing_data)
              return null;
            return createPortal(
              <FrameEditor
                value={editing_frame}
                data={editing_data} />,
              cell,
              cell.id
            )
        }
        return null
      })
    )
  }, [base_data_view, cells, change_flag, editing_data, editing_frame, zip,
    filters_tree, frame_list_view, itr_prefab_list_view, opens, pic_list_view,
    state.flat, state.img, state.json, state.mp3, state.others, tab
  ])

  useEffect(() => {
    const container = ref_wprkspace_container.current
    if (!container) return;

    const adpater = ref_adapter.current ? ref_adapter.current :
      ref_adapter.current = new DomAdapter(container)

    const workspace = (window as any).workspace = (
      ref_workspace.current ?
        ref_workspace.current :
        ref_workspace.current = new Workspaces(adpater)
    );
    workspace.slots.clear()


    workspace.set_root(
      new Slot(workspace, {
        id: 'root',
        type: 'h',
        children: [
          { id: 'res_tree_cell' },
          { id: 'empty' }
        ]
      })
    )
    workspace.edit('res_tree_cell', s => s.weight = 250)
    workspace.edit('empty', s => s.weight = container.offsetWidth - 250)

    workspace.on_changed = () => {
      const cells: HTMLElement[] = []
      for (const leave of workspace.leaves) {
        const cell = adpater.get_cell(leave);
        if (!cell) { debugger; continue; }
        if (!cell.parentElement) workspace.adapter.container.append(cell)
        cells.push(cell)
      }
      set_cells(cells)
    }

    workspace.confirm();
    const ob = new ResizeObserver(() => workspace.confirm())
    ob.observe(container)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    const workspace = ref_workspace.current;
    if (!workspace) return;
    const snapshot = workspace.root?.snapshot()
    if (!snapshot) return;
    const res_tree_slot = snapshot.find('res_tree_cell')
    if (!res_tree_slot) return;
    const { w: res_tree_slot_w } = res_tree_slot.rect!
    const { w: root_w } = snapshot.slot.rect!;

    if (editing_data) {
      if (!workspace.slots.get('frame_preview_cell'))
        workspace.add('res_tree_cell', 'right', { id: 'frame_preview_cell' })

      if (!workspace.slots.get('entity_info_cell'))
        workspace.add('res_tree_cell', 'right', { id: 'entity_info_cell' })
      workspace.del('empty')

      if (editing_frame) {
        if (!workspace.slots.get('frame_editor_cell'))
          workspace.add('frame_preview_cell', 'right', { id: 'frame_editor_cell' })
      } else {
        workspace.del('frame_editor_cell')
      }
      workspace.edit('res_tree_cell', (slot) => {
        slot.weight = snapshot.w('res_tree_cell', 250)
      })
      workspace.edit('entity_info_cell', (slot) => {
        slot.weight = snapshot.w('entity_info_cell', 350)
      })
      workspace.edit('frame_editor_cell', (slot) => {
        slot.weight = snapshot.w('frame_editor_cell', 350)
      })
      workspace.edit('frame_preview_cell', (slot) => {
        slot.weight = snapshot.w() - snapshot.w('entity_info_cell', 0) - snapshot.w('frame_editor_cell', 0) - snapshot.w('res_tree_cell', 0);
      })
    } else {
      // workspace.del('empty')
      workspace.del('entity_info_cell')
      workspace.del('frame_preview_cell')
      workspace.del('frame_editor_cell')

      if (!workspace.slots.get('empty')) {
        workspace.add('res_tree_cell', 'right', { id: 'empty' })
      }

      workspace.edits([0, 'res_tree_cell', 'empty'], 1, ([slot0, slot1, slot2]) => {
        slot0.edit_rect(v => ({ ...v, w: root_w }))
        slot1.weight = res_tree_slot_w
        slot2.weight = root_w - res_tree_slot_w
      })
    }

    workspace.confirm()
  }, [editing_data, editing_frame])

  return !open ? <></> : (
    <shared_ctx.Provider value={{ zip }}>
      {views}
      <Space direction='column' {..._p} stretchs>
        <Combine onClick={e => { e.stopPropagation(); e.preventDefault() }} className={styles.top_bar}>

          <Button onClick={onClose} disabled={loading}>
            ✕
          </Button>
          <Button
            onClick={() => on_click_read_zip().catch(console.warn)}
            disabled={loading}
            variants={'no_border no_round'}>
            打开
          </Button>
          <Show show={!!zips?.length}>
            <Select
              items={zips}
              parse={i => [zips?.indexOf(i), i.name]}
              value={zip ? zips?.indexOf(zip) : void 0}
              onChange={(i) => {
                set_zip(is_num(i) ? zips?.at(i) : void 0)
              }} />
          </Show>
        </Combine>
        <Space.Item style={{ alignSelf: 'stretch', flex: 1, minHeight: '0px', position: 'relative' }}>
          <div ref={ref_wprkspace_container} />
        </Space.Item>
      </Space>
    </shared_ctx.Provider>
  );
}
