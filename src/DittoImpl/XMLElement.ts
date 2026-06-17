import { IXMLElement } from "../LF2/ditto/IXMLElement";

const VALUE_TAGS = new Set(['number', 'boolean', 'object', 'array', 'string', 'value']);

function is_value_child(el: IXMLElement): boolean {
  return VALUE_TAGS.has(el.tagName);
}

export class XMLElement implements IXMLElement {
  readonly inner: Element;
  private _children: XMLElement[] | null = null;
  private _attrs: { name: string; value: string; }[] | null = null;
  get tagName(): string { return this.inner.tagName; }
  get text(): string { return this.inner.textContent ?? ''; }
  constructor(inner: Element) { this.inner = inner; }

  attr(name: string): string | undefined { return this.inner.getAttribute(name) ?? undefined; }

  value(): any {
    const type = this.attr('type') || this.tagName;
    switch (type) {
      case 'number':
        return Number(this.text);
      case 'boolean':
        return this.text === 'true';
      case 'object': {
        const obj: Record<string, any> = {};
        for (const child of this.children) {
          if (is_value_child(child)) {
            const k = child.attr('name');
            if (k) obj[k] = child.value();
          }
        }
        return Object.keys(obj).length ? obj : JSON.parse(this.text);
      }
      case 'array': {
        const arr: any[] = [];
        for (const child of this.children) {
          if (is_value_child(child)) {
            arr.push(child.value());
          }
        }
        return arr;
      }
      default: // string
        return this.text;
    }
  }

  values(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const attr of this.attrs) {
      obj[attr.name] = attr.value;
    }
    for (const child of this.children) {
      if (!is_value_child(child)) continue;
      const key = child.attr('name');
      if (key) obj[key] = child.value();
    }
    return obj;
  }

  nums_attr(name: string): number[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(',').map(s => Number(s.trim()));
  }

  action_str(): string {
    const name = this.attr('action') || this.attr('name');
    if (name) {
      const args = this.attr('args');
      return args ? `${name}(${args})` : `${name}()`;
    }
    return this.text;
  }

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
