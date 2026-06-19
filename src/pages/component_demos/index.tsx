import { Outlet, useNavigate } from "react-router";
import { Space } from "../../Component/Space";
import { type ITreeNode, Tree } from "../../Component/Tree";
import { Paths } from "../../Paths";
import styles from './styles.module.scss';

export const tree_root: ITreeNode[] = Paths.Relations[Paths.All.component_demos]?.map<ITreeNode>(key => {
  return { key, label: key.split('/').findLast(_ => 1) }
}).filter(i => i.label !== '*') ?? []

export default function ComponentDemo() {
  const nav = useNavigate();
  return (
    <Space className={styles.component_demo_root}>
      <Space.Item frame>
        <Tree nodes={tree_root} show_icon={false} on_click_item={i => nav(i.key)} />
      </Space.Item>
      <Space.Item className={styles.right_zone}>
        <Outlet />
      </Space.Item>
    </Space>
  )
}