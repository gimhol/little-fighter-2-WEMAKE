import type { IXMLElement, Voidable } from "../../LF2/ditto/xml/IXMLElement";

export class XMLElement implements IXMLElement {
  readonly inner: Element;
  private _children: XMLElement[] | null = null;
  private _attrs: { name: string; value: string; }[] | null = null;
  private _parent: XMLElement | null = null;

  get type(): string | undefined {
    let type: string | undefined = this.tag.toLowerCase();
    if (type == 'value') type = this.attr('type')?.toLowerCase();
    return type;
  }
  get tag(): string { return this.inner.tagName; }
  get text(): string { return this.inner.textContent ?? ''; }
  constructor(inner: Element) { this.inner = inner; }

  attr(name: string): string | undefined {
    return this.inner.getAttribute(name) ?? undefined;
  }
  set_attr(name: string, value: Voidable<string | number | boolean>): void {
    if (value === void 0 || value === null)
      this.del_attr(name);
    else
      this.inner.setAttribute(name, String(value));
  }
  del_attr(name: string): void {
    this.inner.removeAttribute(name)
  }
  str_attr(name: string): string | undefined {
    return this.attr(name) ?? undefined;
  }
  num_attr(name: string): number | undefined {
    const v = this.attr(name);
    return v != null ? Number(v) : undefined;
  }
  bool_attr(name: string): boolean | undefined {
    const v = this.attr(name);
    return v != null ? v === 'true' || v === '1' : undefined;
  }
  strs_attr(name: string, sep: string = ','): string[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => s.trim());
  }
  nums_attr(name: string, sep: string = ','): number[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => Number(s.trim()));
  }
  strs_attr_soft(name: string, sep: string = ','): Voidable<string>[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => s.trim() || void 0);
  }
  nums_attr_soft(name: string, sep: string = ','): Voidable<number>[] | undefined {
    const v = this.attr(name);
    if (v == null) return void 0;
    return v.split(sep).map(s => s.trim() === '' ? void 0 : Number(s.trim()));
  }
  set_strs_attr(name: string, value: Voidable<string | string[]>, sep: string = ','): void {
    if (value === void 0 || value === null)
      return this.del_attr(name);
    this.set_attr(name, (Array.isArray(value) ? value : [value]).join(sep))

  }
  set_nums_attr(name: string, value: Voidable<number | number[]>, sep: string = ','): void {
    if (value === void 0 || value === null)
      return this.del_attr(name);
    this.set_attr(name, (Array.isArray(value) ? value : [value]).join(sep))
  }
  set_strs_attr_soft(name: string, value: Voidable<Voidable<string> | Voidable<string>[]>, sep: string = ','): void {
    const arr = (Array.isArray(value) ? [...value] : [value]) as Voidable<string>[];
    while (arr.length && (arr[arr.length - 1] === void 0 || arr[arr.length - 1] === null)) arr.pop();
    if (!arr.length) return this.del_attr(name);
    this.set_attr(name, arr.map(s => s ?? '').join(sep));
  }
  set_nums_attr_soft(name: string, value: Voidable<Voidable<number> | Voidable<number>[]>, sep: string = ','): void {
    const arr = (Array.isArray(value) ? [...value] : [value]) as Voidable<number>[];
    while (arr.length && (arr[arr.length - 1] === void 0 || arr[arr.length - 1] === null)) arr.pop();
    if (!arr.length) return this.del_attr(name);
    this.set_attr(name, arr.map(n => n === void 0 ? '' : String(n)).join(sep));
  }
  set_str_attr(name: string, value: Voidable<string>): void {
    if (value === void 0 || value === null)
      return this.del_attr(name);
    this.set_attr(name, value);
  }
  set_num_attr(name: string, value: Voidable<number>): void {
    if (value === void 0 || value === null)
      return this.del_attr(name);
    this.set_attr(name, value.toString());
  }
  set_bool_attr(name: string, value: Voidable<boolean>): void {
    if (value === void 0 || value === null)
      return this.del_attr(name);
    this.set_attr(name, value ? 'true' : 'false');
  }


  value(): number | boolean | string | object | undefined {
    switch (this.type) {
      case 'string': return this.as_string();
      case 'number': return this.as_number();
      case 'boolean': return this.as_boolean();
      case 'array': return this.as_array();
      default: return this.as_object();
    }
  }


  as_string(or: string): string;
  as_string(or?: string): string | undefined;
  as_string(or?: string): string | undefined {
    if ('string' != this.type) return or;
    return this.attr('value') ?? this.text;
  }
  as_number(or: number): number;
  as_number(or?: number): number | undefined;
  as_number(or?: number): number | undefined {
    if ('number' != this.type) return or;
    const txt = this.as_string();
    const ret = Number(txt);
    if (isNaN(ret)) return or;
    return ret;
  }
  as_boolean(or: boolean): boolean;
  as_boolean(or?: boolean): boolean | undefined;
  as_boolean(or?: boolean): boolean | undefined {
    if ('boolean' != this.type) return or;
    const txt = this.as_string()?.toLowerCase();
    if (txt === '1' || txt === 'true') return true;
    if (txt === '0' || txt === 'false') return false;
    return or;
  }
  as_array(or: any[]): any[];
  as_array(or?: any[]): any[] | undefined;
  as_array(or?: any[]): any[] | undefined {
    if ('array' != this.type) return or;
    const ret: any[] = [];
    for (const child of this.children) ret.push(child.value());
    return ret;
  }

  as_object(or: object): object;
  as_object(or?: object): object | undefined;  
  as_object(or?: object): object | undefined {
    const ret: Record<string, any> = {};
    for (const attr of this.attrs)
      ret[attr.name] = attr.value;
    for (const child of this.children) {
      const key = child.attr('name') || child.tag;
      if (key) ret[key] = child.value();
    }
    return Object.keys(ret).length ? ret : or;
  }

  action_str(): string {
    const name = this.attr('action') || this.attr('name');
    if (name) {
      const args = this.attr('args');
      return args ? `${name}(${args})` : `${name}()`;
    }
    return this.text;
  }

  /**
   * 将当前元素及其子元素序列化为 XML 字符串
   * @return {string}
   * @memberof XMLElement
   */
  stringify(): string {
    return this.inner.outerHTML;
  }

  insert(child: XMLElement, index?: number): void {
    child._parent = this;
    if (index === void 0 || index >= this.inner.children.length) {
      this.inner.appendChild(child.inner);
      if (this._children) this._children.push(child);
    } else {
      const ref = this.inner.children[index];
      this.inner.insertBefore(child.inner, ref);
      if (this._children) this._children.splice(index, 0, child);
    }
  }

  remove(child: XMLElement): boolean {
    if (!this.inner.contains(child.inner)) return false;
    this.inner.removeChild(child.inner);
    child._parent = null;
    if (this._children) {
      const i = this._children.indexOf(child);
      if (i >= 0) this._children.splice(i, 1);
    }
    return true;
  }

  remove_self(): boolean {
    const { parentNode } = this.inner;
    if (!parentNode) return false;
    parentNode.removeChild(this.inner);
    this._parent = null;
    return true;
  }

  remove_all(): void {
    if (this._children) {
      for (const c of this._children) c._parent = null;
      this._children.length = 0;
    }
    while (this.inner.firstChild) {
      this.inner.removeChild(this.inner.firstChild);
    }
  }

  get parent(): XMLElement | undefined {
    return this._parent ?? undefined;
  }

  has_attr(name: string): boolean {
    return this.inner.hasAttribute(name);
  }

  set_text(text: string): void {
    this.inner.textContent = text;
  }

  children_by_tag(tag: string): XMLElement[] {
    return this.children.filter(c => c.tag === tag);
  }

  first_by_tag(tag: string): XMLElement | undefined {
    return this.children.find(c => c.tag === tag);
  }

  get children(): XMLElement[] {
    if (!this._children) {
      this._children = [];
      for (const c of this.inner.children) {
        const child = new XMLElement(c);
        child._parent = this;
        this._children.push(child);
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
