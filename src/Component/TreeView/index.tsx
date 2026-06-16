import { useMemo } from "react";
import Show from "../Show";
import styles from "./styles.module.scss";

export interface ITreeNode<D = any> {
  key: string;
  label: React.ReactNode;
  children?: ITreeNode<D>[];
  title?: string;
  data?: D;
  icon?: React.ReactNode;
}
export interface ITreeNodeGetIcon<D> {
  (data: { node: ITreeNode<D>, depth: number, open: boolean }): React.ReactNode
}
export interface ITreeNodeOnClick<D> {
  (node: ITreeNode<D>, e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}
export interface ITreeNodeViewProps<D = any> extends React.HTMLAttributes<HTMLDivElement> {
  node?: ITreeNode<D>;
  nodes?: ITreeNode<D>[];
  depth?: number;
  opens?: string[];
  on_click_item?: ITreeNodeOnClick<D>;
  get_icon?: ITreeNodeGetIcon<D>;
  show_icon?: boolean;
  checkable?: boolean;
  _ref?: React.RefObject<HTMLDivElement | null>;
}
export const file_suffix_emoji_map: { [x in string]?: React.ReactNode } = {
  zip: '📦',
  mp3: '🎼',
  png: '🖼️',
  webp: '🖼️',
}
export function default_get_icon(data: { node: ITreeNode<any>, depth: number, open: boolean }): React.ReactNode {
  const { node, open: is_open } = data;
  if (node.children) return is_open ? '📂' : '📁'
  const { label } = node;
  if (typeof label !== 'string') return '📄'
  const lio = label.lastIndexOf('.');
  if (lio < 0) return '📄'
  const suffix = label.substring(lio + 1).toLowerCase()
  return file_suffix_emoji_map[suffix] || '📄'
}
export function Tree<D = any>(props: ITreeNodeViewProps<D>) {
  const {
    nodes,
    node: _node,
    depth: _depth,
    opens,
    on_click_item,
    className,
    get_icon,
    show_icon = true,
    _ref,
    ...remains
  } = props;

  const [node, is_invisible_root] = useMemo(() => {
    if (_node) return [_node, false];
    if (!nodes) return [void 0, true];
    const ret: ITreeNode = {
      key: "",
      title: "",
      label: "",
      children: nodes,
    }
    return [ret, true]
  }, [_node, nodes])

  const depth = _depth ? _depth : is_invisible_root ? -1 : 0

  if (!node) return <></>
  const open = !opens ? true : opens.find(v => v === node.key) !== void 0;
  const icon = node.icon ?? get_icon?.({ node, depth, open }) ?? default_get_icon({ node, depth, open })
  const head_style = { paddingLeft: 12 * depth }
  const line_style = { left: 12 * depth + 8 }
  const root_classname = [className, styles.tree_item_view].filter(Boolean).join(' ');
  return (
    <div {...remains} className={root_classname} ref={_ref}>
      <Show.Div
        show={!is_invisible_root}
        className={styles.tree_item_head_view}
        style={head_style}
        title={node.title}
        autoFocus
        tabIndex={1}
        onClick={(e) => on_click_item?.(node, e)}>
        {
          !show_icon ? null :
            <div className={styles.icon}>
              {icon}
            </div>
        }
        {node.label}
      </Show.Div>
      <Show show={open}>
        <div
          className={styles.tree_item_col_line}
          style={line_style} />
        {node.children?.map((node, idx) => (
          <Tree
            opens={opens}
            get_icon={get_icon}
            key={idx}
            node={node}
            on_click_item={on_click_item}
            show_icon={show_icon}
            depth={depth + 1} />
        ))}
      </Show>
    </div>
  )
}