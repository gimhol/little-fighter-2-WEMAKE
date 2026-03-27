import Outline from './outline.frag'
import Normal from './normal.vert'
export const Shaders = {
  Fragment: {
    Outline
  },
  Vertex: {
    Normal
  }
} as const;