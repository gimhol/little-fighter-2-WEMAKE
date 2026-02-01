import React from "react"
import type { RouteObject } from "react-router"
export namespace Paths {
  export enum All {
    _ = '',
    main_page = '/'
  }
  export const Components: Record<All, React.ComponentType | null> = {
    [All._]: null,
    [All.main_page]: React.lazy(() => import("./pages/main"))
  }
  export const Relations: { [x in All]?: All[] } = {
    [All._]: [
      All.main_page
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