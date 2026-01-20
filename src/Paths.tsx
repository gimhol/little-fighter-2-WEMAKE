import React from "react"
import { RouteObject } from "react-router"
export namespace Paths {
  export enum All {
    _ = '',
    game = '/',
    quad_tree_test = '/quad_tree_test',
    bebavior_net_test = '/bebavior_net_test',
    editor = '/editor',
    bdy_editor = '/bdy_editor',
    itr_editor = '/itr_editor',
    frame_editor = '/frame_editor',
    network_test = '/network_test',
    workspaces_demo = '/workspaces',
    component_demos = '/component_demos',
    component_demos_InputNumber = '/component_demos/InputNumber',
    component_demos_index = '/component_demos/*',
    component_demos_Button = "/component_demos/Button",
    component_demos_Combine = "/component_demos/Combine",
    component_demos_Select = "/component_demos/Select",
    component_demos_Input = "/component_demos/Input",
    component_demos_Icon = "/component_demos/Icon",
    component_demos_Tag = "/component_demos/Tag",
    dat_viewer = "/dat_viewer",
    custom_game = "/custom_game",
  }
  export const Components: Record<All, React.ComponentType | null> = {
    [All._]: null,
    [All.game]: React.lazy(() => import("./App")),
    [All.quad_tree_test]: React.lazy(() => import("./Laboratory/QuadTree")),
    [All.bebavior_net_test]: React.lazy(() => import("./Laboratory/BehaviorNet")),
    [All.editor]: React.lazy(() => import("./Editor")),
    [All.component_demos]: React.lazy(() => import("./pages/component_demos")),
    [All.component_demos_index]: () => <></>,
    [All.component_demos_InputNumber]: React.lazy(() => import("./pages/component_demos/InputNumberDemo")),
    [All.component_demos_Button]: React.lazy(() => import("./pages/component_demos/ButtonDemo")),
    [All.component_demos_Combine]: React.lazy(() => import("./pages/component_demos/CombineDemo")),
    [All.component_demos_Select]: React.lazy(() => import("./pages/component_demos/SelectDemo")),
    [All.component_demos_Input]: React.lazy(() => import("./pages/component_demos/InputDemo")),
    [All.component_demos_Icon]: React.lazy(() => import("./pages/component_demos/IconDemo")),
    [All.component_demos_Tag]: React.lazy(() => import("./pages/component_demos/TagDemo")),
    [All.workspaces_demo]: React.lazy(() => import("./pages/workspaces_demo")),
    [All.network_test]: React.lazy(() => import("./pages/network_test")),
    [All.bdy_editor]: React.lazy(() => import("./EditorView/FrameEditorView/BdyEditor")),
    [All.itr_editor]: React.lazy(() => import("./EditorView/FrameEditorView/ItrEditor")),
    [All.frame_editor]: React.lazy(() => import("./EditorView/FrameEditorView")),
    [All.dat_viewer]: React.lazy(() => import("./pages/dat_viewer")),
    [All.custom_game]: React.lazy(() => import("./pages/custom_game")),
  }
  export const Relations: { [x in All]?: All[] } = {
    [All._]: [
      All.game,
      All.quad_tree_test,
      All.bebavior_net_test,
      All.component_demos,
      All.editor,
      All.workspaces_demo,
      All.network_test,
      All.bdy_editor,
      All.itr_editor,
      All.frame_editor,
      All.dat_viewer,
      All.custom_game
    ],
    [All.component_demos]: [
      All.component_demos_InputNumber,
      All.component_demos_Button,
      All.component_demos_Combine,
      All.component_demos_Select,
      All.component_demos_Input,
      All.component_demos_index,
      All.component_demos_Icon,
      All.component_demos_Tag,
    ]
  }

  export const gen_route_obj = (path: All, parent?: All): RouteObject => {
    let str_path: string = path
    if (parent !== void 0) {
      if (path.startsWith(parent)) {
        str_path = path.replace(parent, '')
      }
      str_path = str_path.replace(/^\/(.*?)/, (_, a) => a)
    }
    const Component = Components[path] || (() => `component set as ${Components[path]}`);
    const ret: RouteObject = {
      path: str_path,
      element: (
        <React.Suspense>
          <Component />
        </React.Suspense>
      )
    }
    if (Relations[path]) {
      ret.children = Relations[path].map((child_path) => gen_route_obj(child_path, path))
    }
    return ret;
  }
  export const Routes: RouteObject[] = Paths.Relations[Paths.All._]!.map(c => gen_route_obj(c))
}