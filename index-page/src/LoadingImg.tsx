import classNames from "classnames";
import { useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import img_small_loading_frames from "./assets/img_small_loading_frames.png";
import img_small_loading_frames_x4 from "./assets/img_small_loading_frames_x4.png";
export class LoadingImg {
  private tid = 0;
  private img: HTMLImageElement | null = null;
  private _visible: boolean = true;
  private _idx = 0
  readonly w: number;
  readonly h: number;
  set visible(v: boolean) {
    this._visible = v;
    if (this.img) this.img.style.opacity = v ? "1" : "0"
  }
  get visible() { return this._visible }
  constructor(w = 132, h = 84) {
    this.w = w;
    this.h = h;
  }
  set_element(img: HTMLImageElement | null) {
    if (this.img === img) return;
    this.img = img;
    if (!img) return;
    img.style.objectPosition = "0px 0px";
    img.draggable = false;
    img.style.left = img.style.right = img.style.top = img.style.bottom = "0";
    img.style.opacity = this._visible ? "1" : "0"
    this.update_img();
  }
  protected update_img() {
    const { img } = this;
    if (!img) return;
    const x = -this.w * (this._idx % 15);
    const y = -this.h * Math.floor(this._idx / 15);
    img.style.objectPosition = `${x}px ${y}px`;
  }
  protected start() {
    const update = () => {
      window.clearTimeout(this.tid);
      this._idx = (this._idx + 1) % 44;
      this.update_img();
      const t = this._idx === 21 ? 1000 : 30
      if (this.visible || this._idx !== 43) this.tid = window.setTimeout(update, t);
    };
    update();
  }

  hide() {
    this.visible = false;
  }

  show() {
    this.visible = true;
    this.start()
  }
}


export interface ILoadingProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  loading?: boolean;
  big?: boolean;
}
export function Loading(props: ILoadingProps) {
  const { loading, big = false, className, ..._p } = props;
  const logic = useMemo(() => new LoadingImg(33 * (big ? 4 : 1), 21 * (big ? 4 : 1)), [big])

  useEffect(() => {
    loading ? logic.show() : logic.hide();
  }, [loading]);

  const class_name = classNames(className, big ? styles.loading_img_l : styles.loading_img_s)
  const real_src = big ? img_small_loading_frames_x4 : img_small_loading_frames
  return (
    <img
      src={real_src}
      alt="loading..."
      className={class_name}
      ref={r => logic.set_element(r)}
      {..._p} />
  )
}