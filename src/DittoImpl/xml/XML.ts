import { IXMLNode } from "@/LF2";
export class XML implements IXMLNode {
  protected inner: Element;
  protected _children: XML[] | null = null;
  children(tag?: string): XML[] {
    if (!this._children) {
      this._children = [];
      for (const n of this.inner.children) {
        this._children.push(new XML(n))
      }
    }
    if (tag == void 0) return this._children
    return this._children.filter(v => v.tag == tag)
  }
  get tag(): string { return this.inner.nodeName }

  static parse = (text: string): XML => {
    const dp = new DOMParser()
    const doc = dp.parseFromString(text, "text/xml");
    const n = doc.childNodes.item(0)
    if (n instanceof Element) return new XML(n);
    throw new Error('[XML::parse] failed')
  };
  readonly attr = (key: string) => this.inner.getAttribute(key) ?? void 0
  readonly set_attr = (key: string, value: string | undefined): this => {
    if (value == null || value == void 0)
      this.inner.removeAttribute(key)
    else
      this.inner.setAttribute(key, value)
    return this;
  }
  constructor(node: Element) {
    this.inner = node;
  }
}

const aa = XML.parse(`
<node id="ctrl_settings" name="页面：按键设置">
  <template id="suffixies">
  </template>
</node> 
`)


Object.assign(window, { aa })