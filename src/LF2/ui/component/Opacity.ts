import { Delay, Easing, Sequence } from "@/LF2/animation";
import { Animation } from "@/LF2/animation/Animation";
import { ISchema } from "@/LF2/defines";
import ease_linearity from "@/LF2/utils/ease_method/ease_linearity";
import { UIComponent } from "./UIComponent";
import { make_schema } from "@/LF2/utils/schema";

export interface IOpacityFlashProps {
  steps?: number[];
  times?: number;
}
export class OpacityFlash extends UIComponent {
  static override readonly TAG: string = "OpacityFlash";
  static PROPS: ISchema<IOpacityFlashProps> = make_schema({
    key: "IOpacityFlashProps",
    type: 'object',
    properties: {
      steps: {
        key: "steps",
        type: "array",
        items: { type: "number" },
        nullable: true,
        description: "透明度1, 动画时间，透明度2....",
      },
      times: {
        key: "times",
        type: "number",
        nullable: true,
        number: { int: true },
        description: "循环次数，小于0时，无限循环"
      }
    }
  })



  protected _anim: Sequence = new Sequence();
  override on_start(): void {
    super.on_start?.();
    const {
      times = 1,
      steps = [
        0, 350, 1, 100, 1, 350, 0, 350, 1, 100,
        1, 350, 0, 350, 1, 100, 1, 350, 0
      ]
    } = this.props.validate(OpacityFlash.TAG, OpacityFlash.PROPS);

    const anims: Animation[] = [];
    for (let i = 1; i < steps.length; i += 2) {
      const prev_o = steps[i - 1];
      const duration = steps[i];
      const next_o = steps[i + 1];
      if (typeof next_o !== 'number') break;
      if (typeof duration !== 'number') break;
      anims.push(
        prev_o === next_o ?
          new Delay(next_o).set_duration(duration) :
          new Easing(prev_o, next_o).set_duration(duration).set_ease_method(ease_linearity)
      )
    }
    this._anim = new Sequence(...anims)
    this._anim.loop.set_times(times);
  }

  override update(dt: number): void {
    this.node.opacity = this._anim.update(dt).value;
  }
}
