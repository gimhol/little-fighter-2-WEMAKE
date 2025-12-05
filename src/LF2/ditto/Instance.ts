import type { IVector2, IVector3 } from "../defines";
import type { LF2 } from "../LF2";
import type { UINode } from "../ui";
import type { World } from "../World";
import type { ICache } from "./cache";
import type { IFullScreen } from "./fullscreen";
import type { IImageMgr } from "./image/IImageMgr";
import type { IImporter } from "./importer";
import { BaseImporter } from "./importer";
import type { IRender } from "./IRender";
import type { ITimeout } from "./ITimeout";
import type { IKeyboard } from "./keyboard";
import type { IPointings } from "./pointings";
import type { IUINodeRenderer } from "./render/IUINodeRenderer";
import type { IWorldRenderer } from "./render/IWorldRenderer";
import type { ISounds } from "./sounds";
import { BaseSounds } from "./sounds";
import type { IUIInputHandle } from "./ui/IEventHandle";
import type { IZip } from "./zip";
export interface IDitto extends IDittoPack {
  setup(pack: IDittoPack): void;
}

export interface IDittoPack {
  Timeout: ITimeout;
  Interval: ITimeout;
  Render: IRender;
  MD5: (...args: string[]) => string;
  Zip: {
    read_file(file: File): Promise<IZip>;
    read_buf(name: string, buf: Uint8Array): Promise<IZip>;
    download(
      url: string,
      on_progress: (progress: number, size: number) => void
    ): Promise<IZip>;
  };
  Sounds: new (...args: any[]) => ISounds;
  Keyboard: new (lf2: LF2, ...args: any[]) => IKeyboard;
  Pointings: new (...args: any[]) => IPointings;
  FullScreen: new (...args: any[]) => IFullScreen;
  Importer: IImporter;
  Cache: ICache;
  Vector3: new (x?: number, y?: number, z?: number) => IVector3;
  Vector2: new (x?: number, y?: number) => IVector2;
  WorldRender: new (world: World) => IWorldRenderer;
  UINodeRenderer: new (uinode: UINode) => IUINodeRenderer;
  ImageMgr: new (lf2: LF2) => IImageMgr;
  UIInputHandle: new (lf2: LF2) => IUIInputHandle;
  warn(...args: any[]): unknown;
  Log(...args: any[]): unknown;
  debug(...args: any[]): unknown;
  DEV: boolean;
}

const _Ditto: Partial<IDitto> = {
  Importer: new BaseImporter(),
  Sounds: BaseSounds,
  setup(pack: IDittoPack) {
    Object.assign(this, pack);
  },
};
export const Ditto = _Ditto as IDitto