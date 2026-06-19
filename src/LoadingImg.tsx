import cns from "classnames";
import {
  type FC, type ForwardedRef, forwardRef, type ImgHTMLAttributes, type RefAttributes,
  type RefCallback, useEffect, useMemo, useRef, useState
} from "react";
import styles from "./App.module.scss";

interface IFrameInfo {
  x: number; y: number; w: number; h: number, delay: number
}
export class LoadingImg {
  private _raf_id = 0;
  private _el: HTMLImageElement | null = null;
  private _visible = true;
  private _idx = 0;
  private _frames: IFrameInfo[] = [];
  private constructor() { }
  static fromGrid(w: number, h: number, col: number, max: number, delay: number): LoadingImg {
    const inst = new LoadingImg();
    const frames: IFrameInfo[] = [];
    for (let i = 0; i <= max; i++) {
      const x = -w * (i % col);
      const y = -h * Math.floor(i / col);
      frames.push({ x, y, w, h, delay });
    }
    inst._frames = frames;
    return inst;
  }
  get frames(): ReadonlyArray<IFrameInfo> { return this._frames; }
  set visible(v: boolean) {
    this._visible = v;
    if (this._el) this._el.style.opacity = v ? '1' : '0';
  }
  get visible(): boolean {
    return this._visible;
  }

  get element(): HTMLImageElement | null {
    return this._el;
  }
  set element(v: HTMLImageElement | null) {
    this.set_element(v);
  }

  set_element(el: HTMLImageElement | null): void {
    if (this._el === el) return;
    this._el = el;
    if (!el) return;

    el.style.objectPosition = '0 0';
    el.draggable = false;
    el.style.inset = '0';
    el.style.opacity = this._visible ? '1' : '0';
    this.update_img();
  }

  protected update_img(): void {
    const el = this._el;
    const rect = this._frames[this._idx];
    if (!el || !rect) return;
    el.style.objectPosition = `${rect.x}px ${rect.y}px`;
  }

  protected start(): void {
    this.stop();
    const maxIdx = this._frames.length - 1;
    let lastTime = 0;

    const frame = (currentTime: number) => {
      this._raf_id = requestAnimationFrame(frame);
      const { delay } = this._frames[this._idx]
      if (currentTime - lastTime < delay) return;

      lastTime = currentTime;
      this._idx = (this._idx + 1) % this._frames.length;
      this.update_img();

      if (!this.visible && this._idx === maxIdx) {
        this.stop();
      }
    };

    frame(performance.now());
  }

  protected stop(): void {
    if (this._raf_id) {
      cancelAnimationFrame(this._raf_id);
      this._raf_id = 0;
    }
  }

  hide(): void {
    this.visible = false;
  }

  show(): void {
    this.visible = true;
    this.start();
  }
}
export interface ILoadingProps extends
  RefAttributes<HTMLImageElement>,
  Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'src'> {
  loading?: boolean;
  big?: boolean;
}

function LoadingRenderer(props: ILoadingProps, fref: ForwardedRef<HTMLImageElement>) {
  const { loading, big = false, className, alt = 'loading...', onLoad, ..._p } = props;
  const ref_img = useRef<HTMLImageElement | null>(null)
  const [img, set_img] = useState<HTMLImageElement | null>(null);
  const logic = useMemo(() => {
    const w = 33 * (big ? 4 : 1);
    const h = 21 * (big ? 4 : 1);
    const ret = LoadingImg.fromGrid(w, h, 15, 43, 30);
    ret.frames[21].delay = 1000;
    return ret;
  }, [big])

  useEffect(() => {
    logic.set_element(img)
    if (!logic.element) return;
    loading ? logic.show() : logic.hide();
  }, [loading, img]);

  const class_name = cns(className, big ? styles.loading_img_l : styles.loading_img_s)
  const src = big ?
    "builtin_data/launch/SMALL_LOADING@4x.png" :
    "builtin_data/launch/SMALL_LOADING.png";

  const on_ref: RefCallback<HTMLImageElement> = (r: HTMLImageElement | null) => {
    ref_img.current = r
    if (typeof fref === 'function') fref(r);
    else if (fref) fref.current = r;
  }
  const on_load: ImgHTMLAttributes<HTMLImageElement>['onLoad'] = (e) => {
    onLoad?.(e);
    set_img(ref_img.current)
  }
  return (
    <img
      src={src}
      alt={alt}
      className={class_name}
      onLoad={on_load}
      ref={on_ref}
      {..._p} />
  )
}
export const Loading: FC<ILoadingProps> = forwardRef(LoadingRenderer);