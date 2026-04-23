import { Label, Picture, UINode } from "@/LF2";
import { floor, IPropsMeta } from "@/LF2/utils";
import { Sine } from "../../animation/Sine";
import { GamePrepareLogic } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";
export interface ICharMenuHeadProps {
  countdown_label?: Label,
  hints_node?: UINode,
  head_pic?: Picture,
}
/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class CharMenuHead
 * @extends {UIComponent}
 */
export class CharMenuHead extends UIComponent<ICharMenuHeadProps> {
  static override readonly TAGS: string[] = ["CharMenuHead"];
  static override readonly PROPS: IPropsMeta<ICharMenuHeadProps> = {
    countdown_label: { type: Label, nullable: false },
    hints_node: { type: UINode, nullable: false },
    head_pic: { type: Picture, nullable: false },
  };
  protected _joined: boolean = false;
  protected _opacity: Sine = new Sine(0.65, 1, 6);
  protected _path: string = '';
  get countdown_node() { return this.node.find_child("countdown_text") }
  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }
  override on_start(): void {
    this.props.countdown_label?.preload(["5", "4", "3", "2", "1"])
  }
  join(path: string): void {
    this._joined = true;
    this._path = path;
    this.props.head_pic?.set_src(path)
    this.props.hints_node?.set_visible(false);
    this.countdown_node?.set_visible(false);
  }
  quit(): void {
    this._joined = false;
    this._path = '';
    this.props.head_pic?.set_src('')
    this.props.hints_node?.set_visible(true);
    this.countdown_node?.set_visible(false);
  }
  override update(dt: number): void {
    this._opacity.update(dt);
    const hints_visible = !this._joined && !this.countdown_node?.visible
    this.props.hints_node?.set_visible(hints_visible);
    this.props.hints_node?.set_opacity(this._opacity.value);
    this.props.head_pic?.node.set_visible(!hints_visible && !this.countdown_node?.visible && !!this._path)
  }
  count_down(num: number): void {
    num = floor(num)
    this.props.countdown_label?.set_text(`${num}`)
    this.countdown_node?.set_visible(num >= 1);
  }
}
