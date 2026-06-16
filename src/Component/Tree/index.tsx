import cns from "classnames";
import { useMemo } from "react";
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

// ============================================================
// Flat item (used to render tree without DOM nesting)
// ============================================================

interface FlatItem<D = any> {
  node: ITreeNode<D>;
  depth: number;
  isOpen: boolean;
  /** 可见后代数量，用于计算纵向连线高度 */
  descendantCount: number;
}

/** 预估单项行高，用于计算纵向连线 */
const ESTIMATED_ROW_HEIGHT = 22;

/**
 * 将树节点递归展开为扁平数组。
 * 未展开节点（!isOpen）的子节点不出现在数组中。
 */
function flattenNodes<D>(
  nodes: ITreeNode<D>[],
  opens: string[] | undefined,
  depth: number,
): { items: FlatItem<D>[]; totalCount: number } {
  const items: FlatItem<D>[] = [];
  let totalCount = 0;

  for (const node of nodes) {
    const isOpen = !opens || opens.includes(node.key);
    const childResult =
      isOpen && node.children?.length
        ? flattenNodes(node.children, opens, depth + 1)
        : { items: [], totalCount: 0 };

    items.push({
      node,
      depth,
      isOpen,
      descendantCount: childResult.totalCount,
    });
    items.push(...childResult.items);
    totalCount += 1 + childResult.totalCount;
  }

  return { items, totalCount };
}

// ============================================================
// Tree Component (flat DOM, no nesting)
// ============================================================

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
    ..._p
  } = props;

  const rootNodes = useMemo<ITreeNode<D>[]>(() => {
    if (_node) return [_node];
    if (nodes) return nodes;
    return [];
  }, [_node, nodes]);

  const startDepth = _depth ?? 0;

  const flatItems = useMemo<FlatItem<D>[]>(
    () => flattenNodes(rootNodes, opens, startDepth).items,
    [rootNodes, opens, startDepth],
  );

  if (!flatItems.length) return null;

  return (
    <div {..._p} className={cns(styles.tree_view, className)} ref={_ref}>
      {flatItems.map(({ node, depth, isOpen, descendantCount }) => {
        const icon =
          node.icon ??
          get_icon?.({ node, depth, open: isOpen }) ??
          default_get_icon({ node, depth, open: isOpen });

        const headStyle: React.CSSProperties = {
          paddingLeft: 12 * depth + 4,
        };
        const lineStyle: React.CSSProperties = {
          left: 12 * depth + 10,
          height: descendantCount * ESTIMATED_ROW_HEIGHT,
        };

        return (
          <div key={node.key} className={styles.tree_item}>
            <div
              className={styles.tree_item_head_view}
              style={headStyle}
              title={node.title}
              tabIndex={0}
              onClick={(e) => on_click_item?.(node, e)}
            >
              {show_icon ? (
                <div className={styles.icon}>{icon}</div>
              ) : null}
              {node.label}
            </div>
            {isOpen && descendantCount > 0 && (
              <div className={styles.tree_item_col_line} style={lineStyle} />
            )}
          </div>
        );
      })}
    </div>
  );
}