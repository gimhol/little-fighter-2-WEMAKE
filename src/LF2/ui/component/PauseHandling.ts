import { IPropsMeta, UIComponent } from "@/LF2";
export interface IPauseHandlingProps {
  reverse?: boolean;
}
export class PauseHandling extends UIComponent<IPauseHandlingProps> {
  static override readonly TAGS: string[] = ["PauseHandling"];
  static override readonly PROPS: IPropsMeta<IPauseHandlingProps> = {
    reverse: Boolean
  }
  override update(dt: number): void {
    const { paused } = this.world;
    this.node.visible = this.props?.reverse ? !paused : paused
  }
}