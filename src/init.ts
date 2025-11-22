import "current-device";
import * as dom from "./DittoImpl";
import { UINodeRenderer } from "./DittoImpl/renderer/UINodeRenderer";
import { WorldRenderer } from "./DittoImpl/renderer/WorldRenderer";
import { Ditto } from "./LF2/ditto";
import { Debug, Log, Warn } from "./Log";

Ditto.setup({
  Timeout: dom.__Timeout,
  Interval: dom.__Interval,
  Render: dom.__Render,
  Keyboard: dom.__Keyboard,
  Pointings: dom.__Pointings,
  FullScreen: dom.__FullScreen,
  Sounds: dom.__Sounds,
  Cache: dom.__Cache,
  Zip: dom.__Zip,
  MD5: dom.md5,
  Importer: new dom.__Importer(),
  Vector3: dom.Vector3,
  Vector2: dom.Vector2,
  WorldRender: WorldRenderer,
  UINodeRenderer: UINodeRenderer,
  ImageMgr: dom.ImageMgr,
  UIInputHandle: dom.UIInputHandle,
  warn: Warn.print,
  Log: Log.print,
  debug: Debug.print,
  get DEV(): boolean {
    const { hostname, search, hash } = window.location;
    return hostname.startsWith('localhost') ? (
      !search.startsWith('?NO_DEV') && !hash.startsWith('#NO_DEV')
    ) : (
      search.startsWith('?DEV') || hash.startsWith('#DEV')
    );
  }
});
