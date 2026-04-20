import { ReachableGroup } from "./ReachableGroup";
import { UIComponent } from "./UIComponent";


export class Reachable extends UIComponent {
  static override readonly TAGS: string[] = ["Reachable"];
  get group_name(): string {
    return this.args[0] || '';
  }
  get group(): ReachableGroup | undefined {
    return this.node.root.lookup_component(
      ReachableGroup, 
      v => v.name === this.group_name
    );
  }
}
