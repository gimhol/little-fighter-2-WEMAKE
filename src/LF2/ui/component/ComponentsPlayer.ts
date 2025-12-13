import { ISchema } from "@/LF2/defines/ISchema";
import { make_schema } from "@/LF2/utils/schema";
import { IPlayable, is_playable } from "./IPlayable";
import { UIComponent } from "./UIComponent";

export interface IComponentsPlayerProps {
  components?: string;
  local?: boolean;
  recursive?: boolean;
}
export class ComponentsPlayer extends UIComponent implements IPlayable {
  readonly __is_playable__ = true;
  static override readonly TAG: string = 'ComponentsPlayer';
  static PROPS: ISchema<IComponentsPlayerProps> = make_schema({
    key: "IComponentsPlayerProps",
    type: "object",
    properties: {
      components: {
        key: "children",
        type: "array",
        items: { type: "string" },
        nullable: true,
      },
      local: {
        key: "local",
        type: "boolean",
        nullable: true,
      },
      recursive: {
        key: "local",
        type: "boolean",
        nullable: true,
      }
    }
  })
  protected components: ((UIComponent & IPlayable) | null)[] = [];
  override on_start(): void {
    const { components, local, recursive } = this.props.validate(ComponentsPlayer);
    const search_node = local ? this.node : this.node.root;
    if (components?.length) {
      for (let i = 0; i < components.length; i++)
        this.components[i] = null;
      search_node.traversal_components((c, depth) => {
        if (!recursive && depth !== 0) return;
        if (!is_playable(c)) return;
        for (let i = 0; i < components.length; i++) {
          const cid = components[i];
          if (c.id !== cid || this.components[i]?.id === cid || c === this) continue;
          this.components[i] = c;
        }
      })
    }
  }
  start(): void {
    for (const c of this.components) c?.start()
    this.enabled = true
  }
  stop(): void {
    for (const c of this.components) c?.stop()
    this.enabled = false
  }
  replay(): void {
    for (const c of this.components) c?.replay()
    this.enabled = true
  }
}
