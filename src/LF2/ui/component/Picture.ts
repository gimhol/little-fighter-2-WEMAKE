import { ISchemaMeta, IUIImgInfo, UIComponent } from "@/LF2";
import { Ditto } from "@/LF2/ditto";
import { UIImgLoader } from "../UIImgLoader";

export interface IPictureProps {
  width?: number;
  height?: number;
}
export class Picture extends UIComponent<IPictureProps> {
  static override readonly TAGS: string[] = ["Picture", "Image"];
  static override readonly PROPS: ISchemaMeta<IPictureProps> = {
    key: 'IPictureProps',
    properties: {
      width: { type: Number, nullable: true },
      height: { type: Number, nullable: true }
    }
  }
  protected _img_loader = new UIImgLoader(() => this.node);

  get width() { return this.props.width ?? this.node.w }
  get height() { return this.props.height ?? this.node.h }
  get src(): string { return this.node.imgs.value[0].src; }
  set src(v: string) { this.set_src(v); }
  set_src(v: string): this {
    const info: IUIImgInfo = { path: v, dw: this.width, dh: this.height }
    this._img_loader.load([info]).catch(e => Ditto.warn(`[${Picture.TAG}::set_src]` + e));
    return this;
  }
}
