import Outline from './outline.frag'
import Normal from './normal.vert'
import Text from './text.frag'
export const Shaders = {
  Fragment: {
    Outline,
    Text
  },
  Vertex: {
    Normal
  }
} as const;