import { ISchema, make_schema, UIComponent } from "@/LF2";
export interface IPauseHandlingProps {
  reverse?: boolean;
}
export class PauseHandling extends UIComponent<IPauseHandlingProps> {
  static override readonly TAGS: string[] = ["PauseHandling"];
  static override PROPS: ISchema<any> = make_schema({
    key: "IPauseHandlingProps",
    type: "object",
    properties: {
      reverse: Boolean
    }
  })
  override update(dt: number): void {
    const { paused } = this.world;
    this.node.visible = this.props?.reverse ? !paused : paused
  }
}