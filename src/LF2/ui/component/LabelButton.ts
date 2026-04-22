import { Easing, IPropsMeta, Label, UIComponent, UINode } from "@/LF2";
export interface ILabelButtonProps {
  back_label?: Label;
  hover_label?: Label;
  responser?: UINode;
  normal_color?: string;
  hover_color?: string;
  disable_color?: string;
  text?: string;
}
export class LabelButton extends UIComponent<ILabelButtonProps> {
  static override readonly TAGS: string[] = ["LabelButton"];
  static override readonly PROPS: IPropsMeta<ILabelButtonProps> = {
    back_label: Label,
    hover_label: Label,
    responser: UINode,
    normal_color: String,
    hover_color: String,
    disable_color: String,
    text: String,
  };
  protected anim = new Easing(0, 1).set_duration(150);
  get responser(): UINode {
    return this.props.responser ?? this.node;
  }
  get normal_color(): string {
    return this.props.normal_color ?? '#5A73D6'
  }
  get hover_color(): string {
    return this.props.hover_color ?? 'white'
  }
  get text(): string {
    return this.props.back_label?.text ?? '';
  }
  set text(v: string) {
    this.props.back_label?.set_text(v);
    this.props.hover_label?.set_text(v);
  }
  override update(dt: number): void {
    const { responser } = this;
    const reverse = (!responser.pointer_over && !responser.focused) || !!responser.pointer_down;
    const { hover_label: front_label } = this.props;
    if (front_label) front_label.node.opacity = this.anim.auto_trip(reverse, dt).value;
  }
}