import "current-device";
import * as dom from "./DittoImpl";
import { UINodeRenderer } from "./DittoImpl/renderer/UINodeRenderer";
import { WorldRenderer } from "./DittoImpl/renderer/WorldRenderer";
import { Ditto } from "./LF2/ditto";
import { Debug, Log, Warn } from "./Log";
import actor from "./LF2/ui/action/Actor";
import { UIActionEnum } from "./LF2/ui/UIActionEnum";
import './i18n';
actor
  .add(UIActionEnum.Alert, (_, msg) => window.alert(msg))
  .add(UIActionEnum.LinkTo, (_, url) => window.open(url))
  .add(UIActionEnum.Exit, () => window.confirm("确定退出?") && window.close())

const DEV = window.location.href.includes('DEV=1')
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
  DEV
});