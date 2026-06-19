import { type Key, type ReactNode, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { DomAdapter, Styling } from "splittings-dom/dist/es/splittings-dom";
import "splittings-dom/dist/es/splittings-dom.css";
import { Slot, Workspaces } from "splittings/dist/es/splittings";


export interface IUseWorkspacesOpts {
  container: HTMLElement | null;
  render?: (slot: Slot, el: HTMLElement, idx: number) => ReactNode;
  key?: (slot: Slot, el: HTMLElement, idx: number) => Key
}
export function useWorkspaces(opts: IUseWorkspacesOpts) {
  const { render, key, container } = opts;

  useEffect(() => {
    const styling = new Styling().override('leaf', s => {
      s.borderRight = '1px solid #5555CC55';
      s.borderBottom = '1px solid #5555CC55';
      return s
    }).build();
    styling.mount()
    return () => { styling.unmount() }
  }, [])

  const [_container, set_container] = useState<HTMLElement | null>(container)
  const [pairs, set_pairs] = useState<[Slot, HTMLElement][]>([])
  const [workspace, set_workspace] = useState<Workspaces | null>(null)
  useEffect(() => {
    if (!_container) return;
    const adpater = new DomAdapter(_container)
    adpater.workspaces_rect = (ws) => {
      const r = _container.getBoundingClientRect();
      return { x: 0, y: 0, w: Math.ceil(r.width + 2), h: Math.ceil(r.height + 2) };
    }

    const workspace = new Workspaces(adpater)
    workspace.root.keep = true;
    workspace.on_leaves_changed = () => {
      const pairs: [Slot, HTMLElement][] = []
      for (const leaf of workspace.leaves) {
        const cell = adpater.get_cell(leaf)
        if (!cell || cell.children.length) continue;
        if (!cell.parentElement) workspace.adapter.container.appendChild(cell);
        pairs.push([leaf, cell]);
      }
      set_pairs(pairs)
    }
    workspace.confirm()
    set_workspace(workspace);
    return () => {
      workspace.on_leaves_changed = void 0
      workspace.root.release()
      workspace.release()
    }
  }, [_container])

  const context = useMemo(() => {
    if (!render) return <></>
    return (
      <>
        {pairs.map(([slot, el], idx) => ReactDOM.createPortal(render(slot, el, idx), el, key ? key(slot, el, idx) : idx))}
      </>
    )
  }, [pairs, render, key])

  return { workspace, set_container, pairs, context };
}
