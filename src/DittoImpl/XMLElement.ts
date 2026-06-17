import { IXMLElement } from "../LF2/ditto/IXMLElement";

export class XMLElement implements IXMLElement {
  readonly inner: Element;
  private _children: XMLElement[] | null = null;
  private _attrs: { name: string; value: string; }[] | null = null;
  get tagName(): string { return this.inner.tagName; }
  constructor(inner: Element) { this.inner = inner; }

  attr(name: string): string | null { return this.inner.getAttribute(name); }

  get children(): XMLElement[] {
    if (!this._children) {
      this._children = [];
      for (const c of this.inner.children) {
        this._children.push(new XMLElement(c));
      }
    }
    return this._children;
  }

  get attrs(): { name: string; value: string; }[] {
    if (!this._attrs) {
      this._attrs = [];
      const map = this.inner.attributes;
      for (let i = 0; i < map.length; i++) {
        const a = map.item(i)!;
        this._attrs.push({ name: a.name, value: a.value });
      }
    }
    return this._attrs;
  }
}
