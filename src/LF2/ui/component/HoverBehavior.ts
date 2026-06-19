import { type IPropsMeta, UIComponent } from "@/LF2";

export interface IHoverBehaviorProps {
  behavior?: string;
}
export class HoverBehavior extends UIComponent<IHoverBehaviorProps> {
  static override readonly TAGS: string[] = ["HoverBehavior"];
  static override readonly PROPS: IPropsMeta<IHoverBehaviorProps> = {
    behavior: String
  };
  static BehaviorMap = new Map<string, [(owner: HoverBehavior) => void, (owner: HoverBehavior) => void]>([
    ['focus', [
      (owner: HoverBehavior) => {
        owner.node.focused = true
      },
      (owner: HoverBehavior) => { },
    ]]
  ]);
  get behavior(): string { return this.props.behavior?.trim().toLowerCase() || 'default'; }
  override on_pointer_enter(): void {
    HoverBehavior.BehaviorMap.get(this.behavior)?.[0](this);
  }
  override on_pointer_leave(): void {
    HoverBehavior.BehaviorMap.get(this.behavior)?.[1](this);
  }
}
